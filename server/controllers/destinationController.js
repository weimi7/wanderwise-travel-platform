const pool = require('../config/db');

// GET /api/destinations with pagination and optional filters (category, search)
const getAllDestinations = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req. query.limit, 10) || 8;
    const offset = (page - 1) * limit;

    const { category, search } = req.query;

    const filters = [];
    const params = [];

    if (category && category. trim() !== '' && category !== 'All') {
      params.push(`%${category.trim()}%`);
      filters.push(`category ILIKE $${params.length}`);
    }

    if (search && search. trim() !== '') {
      params.push(`%${search.trim()}%`);
      filters.push(`(name ILIKE $${params. length} OR small_description ILIKE $${params.length})`);
    }

    const whereClause = filters.length ?  `WHERE ${filters.join(' AND ')}` : '';

    // Enhanced query with real review aggregation
    const dataQuery = `
      SELECT 
        d.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count
      FROM destinations d
      LEFT JOIN reviews r ON r.reviewable_type = 'destination' 
        AND r.reviewable_id = d.destination_id 
        AND r.status = 'published'
      ${whereClause}
      GROUP BY d.destination_id
      ORDER BY d.name ASC
      LIMIT $${params.length + 1}
      OFFSET $${params. length + 2}
    `;

    const dataParams = [...  params, limit, offset];
    const result = await pool.query(dataQuery, dataParams);

    // Total count
    const countQuery = `SELECT COUNT(*) FROM destinations ${whereClause}`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult. rows[0].count, 10);

    res.json({
      destinations: result.rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    });
  } catch (err) {
    console.error("❌ Error in getAllDestinations:", err. message || err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/destinations/slug/:slug
const getDestinationBySlug = async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    return res.status(400).json({ error: 'Slug parameter is required' });
  }

  try {
    const query = `
      SELECT 
        d.*,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count,
        COALESCE(
          json_object_agg(
            r. rating,
            rating_counts. count
          ) FILTER (WHERE r.rating IS NOT NULL),
          '{}':: json
        ) AS rating_breakdown
      FROM destinations d
      LEFT JOIN reviews r ON r.reviewable_type = 'destination' 
        AND r.reviewable_id = d.destination_id 
        AND r.status = 'published'
      LEFT JOIN LATERAL (
        SELECT r2.rating, COUNT(*) as count
        FROM reviews r2
        WHERE r2.reviewable_type = 'destination'
          AND r2.reviewable_id = d.destination_id
          AND r2.status = 'published'
        GROUP BY r2.rating
      ) AS rating_counts ON true
      WHERE d.slug = $1
      GROUP BY d.destination_id
      LIMIT 1
    `;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      return res. status(404).json({ error: 'Destination not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(`❌ Error fetching destination with slug "${slug}":`, err);
    res.status(500).json({ error: 'Failed to fetch destination' });
  }
};

// GET nearby destinations by destination_id (with reviews)
const getNearbyDestinations = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Destination ID is required' });
  }

  try {
    const query = `
      SELECT 
        d. destination_id, 
        d.name, 
        d.slug, 
        d.category, 
        d.small_description, 
        d.image_url, 
        d.location,
        COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0) AS avg_rating,
        COUNT(DISTINCT r.review_id) AS review_count
      FROM destination_nearby dn
      JOIN destinations d ON d.destination_id = dn. nearby_destination_id
      LEFT JOIN reviews r ON r.reviewable_type = 'destination' 
        AND r.reviewable_id = d.destination_id 
        AND r.status = 'published'
      WHERE dn.destination_id = $1
      GROUP BY d.destination_id
      ORDER BY d.name ASC
    `;

    const { rows } = await pool.query(query, [id]);
    res.status(200).json(rows || []);
  } catch (error) {
    console.error('❌ Error fetching nearby destinations:', error);
    res.status(500).json({ error: 'Failed to fetch nearby destinations' });
  }
};

// POST /api/destinations
const createDestination = async (req, res) => {
  const requiredFields = [
    'name',
    'slug',
    'category',
    'location',
    'small_description',
    'long_description'
  ];

  for (const field of requiredFields) {
    if (!req.body[field]) {
      return res.status(400).json({ error: `Field "${field}" is required` });
    }
  }

  const {
    name,
    slug,
    category,
    location,
    small_description,
    long_description,
    image_url = null,
    highlights = null,
    best_time = null,
    what_to_bring = null,
    facilities = null,
    tips = null,
    price = null,
    duration = null,
    difficulty = null,
    latitude = null,
    longitude = null
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO destinations (
        name, slug, category, location,
        small_description, long_description, image_url,
        highlights, best_time, what_to_bring, facilities, tips,
        price, duration, difficulty, latitude, longitude
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING *
      `,
      [
        name, slug, category, location,
        small_description, long_description, image_url,
        highlights, best_time, what_to_bring, facilities, tips,
        price, duration, difficulty, latitude, longitude
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating destination:', err);
    res.status(500).json({ error: 'Failed to create destination' });
  }
};

module.exports = {
  getAllDestinations,
  getDestinationBySlug,
  getNearbyDestinations,
  createDestination
};