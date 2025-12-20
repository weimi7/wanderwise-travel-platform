const pool = require('../config/db');

// Helper: slugify
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-");

// Helper: group rows into activity objects with categories + destinations
const formatActivities = (rows) => {
  const map = {};
  rows.forEach((row) => {
    if (!map[row.activity_id]) {
      map[row.activity_id] = {
        activity_id: row.activity_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        image_url: row.image_url,
        min_price: row.min_price,
        max_price: row.max_price,
        original_price: row.original_price,
        currency: row.currency,
        free_cancellation: row.free_cancellation,
        rating: row.rating,
        review_count: row.review_count,
        rating_breakdown: row.rating_breakdown,
        duration: row.duration,
        group_size: row.group_size,
        max_participants: row.max_participants,
        difficulty: row.difficulty,
        season: row.season,
        age_limit: row.age_limit,
        availability: row.availability,
        inclusions: row.inclusions,
        exclusions: row.exclusions,
        highlights: row.highlights,
        accessibility: row.accessibility,
        weather_notes: row.weather_notes,
        operator_name: row.operator_name,
        pickup_info: row.pickup_info,
        cancellation_policy: row.cancellation_policy,
        categories: [],
        destinations: [],
      };
    }
    // categories
    if (row.category_name && !map[row.activity_id].categories.includes(row.category_name)) {
      map[row.activity_id].categories.push(row.category_name);
    }
    // destinations
    if (row.destination_id && row.destination_name) {
      if (!map[row.activity_id].destinations.some(d => d.destination_id === row.destination_id)) {
        map[row.activity_id].destinations.push({
          destination_id: row.destination_id,
          name: row.destination_name
        });
      }
    }
  });
  return Object.values(map);
};

// Complete SELECT query with all fields
const COMPLETE_ACTIVITY_QUERY = `
  SELECT 
    a.activity_id,
    a.name,
    a.slug,
    a.description,
    a.image_url,
    a.min_price,
    a.max_price,
    a.original_price,
    a.currency,
    a.free_cancellation,
    CAST(a.rating AS FLOAT) AS rating,
    a.review_count,
    a.rating_breakdown,
    a.duration,
    a.group_size,
    a.max_participants,
    a.difficulty,
    a.season,
    a.age_limit,
    a.availability,
    a.inclusions,
    a.exclusions,
    a.highlights,
    a.accessibility,
    a.weather_notes,
    a.operator_name,
    a.pickup_info,
    a.cancellation_policy,
    c.name AS category_name,
    d.destination_id,
    d.name AS destination_name
  FROM activities a
  LEFT JOIN activity_categories ac ON a.activity_id = ac.activity_id
  LEFT JOIN categories c ON ac.category_id = c.category_id
  LEFT JOIN destination_activities da ON a.activity_id = da.activity_id
  LEFT JOIN destinations d ON da.destination_id = d.destination_id
`;

// GET all activities
exports.getAllActivities = async (req, res) => {
  try {
    const result = await pool.query(
      `${COMPLETE_ACTIVITY_QUERY} ORDER BY a.name`
    );

    res.json({ activities: formatActivities(result.rows) });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};

// GET random activities (limit 3)
exports.getRandomActivities = async (req, res) => {
  try {
    const result = await pool.query(
      `${COMPLETE_ACTIVITY_QUERY} ORDER BY RANDOM() LIMIT 3`
    );

    res.status(200).json(formatActivities(result.rows));
  } catch (err) {
    console.error('Error fetching random activities:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET activities by destination ID
exports.getActivitiesByDestination = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT 
        a.activity_id,
        a.name,
        a.slug,
        a.description,
        a.image_url,
        a.min_price,
        a.max_price,
        a.original_price,
        a.currency,
        a.free_cancellation,
        CAST(a.rating AS FLOAT) AS rating,
        a.review_count,
        a.rating_breakdown,
        a.duration,
        a.group_size,
        a.max_participants,
        a.difficulty,
        a.season,
        a.age_limit,
        a.availability,
        a.inclusions,
        a.exclusions,
        a.highlights,
        a.accessibility,
        a.weather_notes,
        a.operator_name,
        a.pickup_info,
        a.cancellation_policy,
        c.name AS category_name,
        d.destination_id,
        d.name AS destination_name
      FROM activities a
      JOIN destination_activities da ON a.activity_id = da.activity_id
      JOIN destinations d ON da.destination_id = d.destination_id
      LEFT JOIN activity_categories ac ON a.activity_id = ac.activity_id
      LEFT JOIN categories c ON ac.category_id = c.category_id
      WHERE da.destination_id = $1
      ORDER BY a.name
      `,
      [id]
    );

    res.status(200).json(formatActivities(result.rows));
  } catch (err) {
    console.error('Error fetching activities by destination:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single activity by slug (SEO-friendly)
exports.getActivityBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `${COMPLETE_ACTIVITY_QUERY} WHERE a.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json(formatActivities(result.rows)[0]);
  } catch (err) {
    console.error('Error fetching activity by slug:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET single activity by ID
exports.getActivityById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `${COMPLETE_ACTIVITY_QUERY} WHERE a.activity_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.status(200).json(formatActivities(result.rows)[0]);
  } catch (err) {
    console.error("Error fetching activity by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// POST create activity
exports.createActivity = async (req, res, next) => {
  const { 
    name, description, image_url, min_price, max_price, original_price, 
    currency, free_cancellation, rating, review_count, rating_breakdown,
    duration, group_size, max_participants, difficulty, season, age_limit,
    availability, inclusions, exclusions, highlights, accessibility,
    weather_notes, operator_name, pickup_info, cancellation_policy,
    categories = [], destinations = [] 
  } = req.body;
  
  try {
    const slug = slugify(name);

    // Insert activity with all fields
    const result = await pool.query(
      `
      INSERT INTO activities (
        name, slug, description, image_url, min_price, max_price, original_price,
        currency, free_cancellation, rating, review_count, rating_breakdown,
        duration, group_size, max_participants, difficulty, season, age_limit,
        availability, inclusions, exclusions, highlights, accessibility,
        weather_notes, operator_name, pickup_info, cancellation_policy
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,COALESCE($8,'USD'),$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
      RETURNING *
      `,
      [
        name, slug, description, image_url, min_price, max_price, original_price,
        currency, free_cancellation, rating, review_count, rating_breakdown,
        duration, group_size, max_participants, difficulty, season, age_limit,
        availability, inclusions, exclusions, highlights, accessibility,
        weather_notes, operator_name, pickup_info, cancellation_policy
      ]
    );

    const activity = result.rows[0];

    // Link categories
    for (const catName of categories) {
      const catRes = await pool.query(`SELECT category_id FROM categories WHERE name=$1`, [catName]);
      let categoryId;
      if (catRes.rows.length === 0) {
        const newCat = await pool.query(`INSERT INTO categories (name) VALUES ($1) RETURNING category_id`, [catName]);
        categoryId = newCat.rows[0].category_id;
      } else {
        categoryId = catRes.rows[0].category_id;
      }
      await pool.query(`INSERT INTO activity_categories (activity_id, category_id) VALUES ($1,$2)`, [activity.activity_id, categoryId]);
    }

    // Link destinations
    for (const destId of destinations) {
      await pool.query(`INSERT INTO destination_activities (destination_id, activity_id) VALUES ($1,$2)`, [destId, activity.activity_id]);
    }

    res.status(201).json(activity);
  } catch (err) {
    console.error('Error creating activity:', err);
    next(err);
  }
};

// PUT update activity
exports.updateActivity = async (req, res, next) => {
  const { id } = req.params;
  const { 
    name, description, image_url, min_price, max_price, original_price,
    currency, free_cancellation, rating, review_count, rating_breakdown,
    duration, group_size, max_participants, difficulty, season, age_limit,
    availability, inclusions, exclusions, highlights, accessibility,
    weather_notes, operator_name, pickup_info, cancellation_policy,
    categories = [], destinations = [] 
  } = req.body;

  try {
    const slug = slugify(name);

    const result = await pool.query(
      `
      UPDATE activities
      SET name=$1, slug=$2, description=$3, image_url=$4, min_price=$5, max_price=$6, 
          original_price=$7, currency=COALESCE($8,'USD'), free_cancellation=$9, rating=$10, 
          review_count=$11, rating_breakdown=$12, duration=$13, group_size=$14, 
          max_participants=$15, difficulty=$16, season=$17, age_limit=$18, availability=$19, 
          inclusions=$20, exclusions=$21, highlights=$22, accessibility=$23, 
          weather_notes=$24, operator_name=$25, pickup_info=$26, cancellation_policy=$27
      WHERE activity_id=$28
      RETURNING *
      `,
      [
        name, slug, description, image_url, min_price, max_price, original_price,
        currency, free_cancellation, rating, review_count, rating_breakdown,
        duration, group_size, max_participants, difficulty, season, age_limit,
        availability, inclusions, exclusions, highlights, accessibility,
        weather_notes, operator_name, pickup_info, cancellation_policy, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    const activity = result.rows[0];

    // Reset categories
    await pool.query(`DELETE FROM activity_categories WHERE activity_id=$1`, [id]);
    for (const catName of categories) {
      const catRes = await pool.query(`SELECT category_id FROM categories WHERE name=$1`, [catName]);
      let categoryId;
      if (catRes.rows.length === 0) {
        const newCat = await pool.query(`INSERT INTO categories (name) VALUES ($1) RETURNING category_id`, [catName]);
        categoryId = newCat.rows[0].category_id;
      } else {
        categoryId = catRes.rows[0].category_id;
      }
      await pool.query(`INSERT INTO activity_categories (activity_id, category_id) VALUES ($1,$2)`, [id, categoryId]);
    }

    // Reset destinations
    await pool.query(`DELETE FROM destination_activities WHERE activity_id=$1`, [id]);
    for (const destId of destinations) {
      await pool.query(`INSERT INTO destination_activities (destination_id, activity_id) VALUES ($1,$2)`, [destId, id]);
    }

    res.status(200).json(activity);
  } catch (err) {
    console.error('Error updating activity:', err);
    next(err);
  }
};

// DELETE activity
exports.deleteActivity = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM activities WHERE activity_id=$1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (err) {
    console.error('Error deleting activity:', err);
    next(err);
  }
};