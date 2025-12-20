const pool = require('../config/db');

// GET /api/accommodations - Get all accommodations with filters + pagination
const getAllAccommodations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      city,
      country,
      min_price,
      max_price,
      min_rating,
      amenities,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE conditions
    let whereConditions = ['a.is_active = true'];
    let queryParams = [];
    let paramIndex = 1;

    if (type) {
      whereConditions.push(`a.type = $${paramIndex}`);
      queryParams.push(type);
      paramIndex++;
    }
    if (city) {
      whereConditions.push(`LOWER(a.city) = LOWER($${paramIndex})`);
      queryParams.push(city);
      paramIndex++;
    }
    if (country) {
      whereConditions.push(`LOWER(a.country) = LOWER($${paramIndex})`);
      queryParams.push(country);
      paramIndex++;
    }
    if (min_price) {
      whereConditions.push(`a.base_price_per_night >= $${paramIndex}`);
      queryParams.push(parseFloat(min_price));
      paramIndex++;
    }
    if (max_price) {
      whereConditions.push(`a.base_price_per_night <= $${paramIndex}`);
      queryParams.push(parseFloat(max_price));
      paramIndex++;
    }
    if (min_rating) {
      whereConditions.push(`a.rating >= $${paramIndex}`);
      queryParams.push(parseFloat(min_rating));
      paramIndex++;
    }
    if (search) {
      whereConditions.push(
        `(LOWER(a.name) LIKE LOWER($${paramIndex}) OR LOWER(a.description) LIKE LOWER($${paramIndex}) OR LOWER(a.city) LIKE LOWER($${paramIndex}))`
      );
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Amenities filter
    let amenityJoin = '';
    if (amenities) {
      const amenityIds = amenities.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (amenityIds.length > 0) {
        amenityJoin = `
          AND a.accommodation_id IN (
            SELECT DISTINCT aa.accommodation_id 
            FROM accommodation_amenities aa 
            WHERE aa.amenity_id = ANY($${paramIndex})
            GROUP BY aa.accommodation_id 
            HAVING COUNT(DISTINCT aa.amenity_id) = ${amenityIds.length}
          )
        `;
        queryParams.push(amenityIds);
        paramIndex++;
      }
    }

    // Main query
    const query = `
      WITH accommodation_data AS (
        SELECT 
          a.*,
          ai_header.image_url as header_image,
          ai_header.alt_text as header_image_alt,
          ARRAY(
            SELECT json_build_object(
              'amenity_id', am.amenity_id,
              'name', am.name,
              'icon', am.icon,
              'category', am.category
            )
            FROM accommodation_amenities aa
            JOIN amenities am ON aa.amenity_id = am.amenity_id
            WHERE aa.accommodation_id = a.accommodation_id
            ORDER BY RANDOM()
            LIMIT 4
          ) as amenities,
          (
            SELECT COUNT(*) 
            FROM accommodation_amenities aa2 
            WHERE aa2.accommodation_id = a.accommodation_id
          ) as total_amenities
        FROM accommodations a
        LEFT JOIN accommodation_images ai_header ON a.accommodation_id = ai_header.accommodation_id 
          AND ai_header.image_type = 'header'
        ${whereClause}
        ${amenityJoin}
        ORDER BY a.rating DESC, a.name ASC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      )
      SELECT * FROM accommodation_data
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT a.accommodation_id) as total
      FROM accommodations a
      ${whereClause}
      ${amenityJoin}
    `;
    const countParams = queryParams.slice(0, -2);

    const [accommodations, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      status: 'success',
      accommodations: accommodations.rows,
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next: page < totalPages,
        has_prev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching accommodations:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// GET /api/accommodations/slug/:slug - Get accommodation by slug with detailed info
const getAccommodationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT 
        a.*,
        -- Get header image
        ai_header.image_url as header_image,
        ai_header.alt_text as header_image_alt,
        
        -- Get all gallery images
        ARRAY(
          SELECT json_build_object(
            'image_id', ai.image_id,
            'image_url', ai.image_url,
            'alt_text', ai.alt_text,
            'display_order', ai.display_order
          )
          FROM accommodation_images ai
          WHERE ai.accommodation_id = a.accommodation_id 
          AND ai.image_type = 'gallery'
          ORDER BY ai.display_order ASC
        ) as gallery_images,

        -- Get all amenities grouped by category
        COALESCE(
          json_object_agg(
            am.category,
            (
              SELECT json_agg(amenity_obj ORDER BY amenity_obj->>'name')
              FROM (
                SELECT json_build_object(
                  'amenity_id', am2.amenity_id,
                  'name', am2.name,
                  'icon', am2.icon
                ) AS amenity_obj
                FROM amenities am2
                JOIN accommodation_amenities aa2 
                  ON aa2.amenity_id = am2.amenity_id
                WHERE aa2.accommodation_id = a.accommodation_id
                  AND am2.category = am.category
              ) sub
            )
          ) FILTER (WHERE am.category IS NOT NULL),
          '{}'::json
        ) as amenities_by_category,

        -- Get room types with images
        ARRAY(
          SELECT json_build_object(
            'room_type_id', rt.room_type_id,
            'name', rt.name,
            'description', rt.description,
            'capacity', rt.capacity,
            'bedrooms', rt.bedrooms,
            'bathrooms', rt.bathrooms,
            'size_sqm', rt.size_sqm,
            'price_per_night', rt.price_per_night,
            'total_rooms', rt.total_rooms,
            'is_available', rt.is_available,
            'images', ARRAY(
              SELECT json_build_object(
                'image_url', rti.image_url,
                'alt_text', rti.alt_text,
                'display_order', rti.display_order
              )
              FROM room_type_images rti
              WHERE rti.room_type_id = rt.room_type_id
              ORDER BY rti.display_order ASC
            ),
            'amenities', ARRAY(
              SELECT json_build_object(
                'amenity_id', rta.amenity_id,
                'name', am_rt.name,
                'icon', am_rt.icon,
                'category', am_rt.category
              )
              FROM room_type_amenities rta
              JOIN amenities am_rt ON rta.amenity_id = am_rt.amenity_id
              WHERE rta.room_type_id = rt.room_type_id
              ORDER BY am_rt.category, am_rt.name
            )
          )
          FROM room_types rt
          WHERE rt.accommodation_id = a.accommodation_id
          AND rt.is_available = true
          ORDER BY rt.price_per_night ASC
        ) as room_types

      FROM accommodations a
      LEFT JOIN accommodation_images ai_header 
        ON a.accommodation_id = ai_header.accommodation_id 
       AND ai_header.image_type = 'header'
      LEFT JOIN accommodation_amenities aa 
        ON a.accommodation_id = aa.accommodation_id
      LEFT JOIN amenities am 
        ON aa.amenity_id = am.amenity_id
      WHERE a.slug = $1 AND a.is_active = true
      GROUP BY a.accommodation_id, ai_header.image_url, ai_header.alt_text
    `;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Accommodation not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        accommodation: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error fetching accommodation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};


// GET /api/accommodations/:id/room-types - Get room types for specific accommodation
const getAccommodationRoomTypes = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        rt.*,
        -- Get room type images
        ARRAY(
          SELECT json_build_object(
            'image_url', rti.image_url,
            'alt_text', rti.alt_text,
            'display_order', rti.display_order
          )
          FROM room_type_images rti
          WHERE rti.room_type_id = rt.room_type_id
          ORDER BY rti.display_order ASC
        ) as images,
        -- Get room type amenities
        ARRAY(
          SELECT json_build_object(
            'amenity_id', am.amenity_id,
            'name', am.name,
            'icon', am.icon,
            'category', am.category
          )
          FROM room_type_amenities rta
          JOIN amenities am ON rta.amenity_id = am.amenity_id
          WHERE rta.room_type_id = rt.room_type_id
          ORDER BY am.category, am.name
        ) as amenities
      FROM room_types rt
      WHERE rt.accommodation_id = $1 AND rt.is_available = true
      ORDER BY rt.price_per_night ASC
    `;

    const result = await pool.query(query, [id]);

    res.status(200).json({
      status: 'success',
      data: {
        room_types: result.rows
      }
    });

  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// GET /api/accommodations/:id/amenities - Get amenities for specific accommodation
const getAccommodationAmenities = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        am.*
      FROM amenities am
      JOIN accommodation_amenities aa ON am.amenity_id = aa.amenity_id
      WHERE aa.accommodation_id = $1
      ORDER BY am.category, am.name
    `;

    const result = await pool.query(query, [id]);

    // Group amenities by category
    const amenitiesByCategory = result.rows.reduce((acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        amenities: result.rows,
        amenities_by_category: amenitiesByCategory
      }
    });

  } catch (error) {
    console.error('Error fetching amenities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// GET /api/accommodations/:id/images - Get images for specific accommodation
const getAccommodationImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // filter by image type

    let query = `
      SELECT *
      FROM accommodation_images
      WHERE accommodation_id = $1
    `;

    const params = [id];

    if (type) {
      query += ` AND image_type = $2`;
      params.push(type);
    }

    query += ` ORDER BY display_order ASC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      status: 'success',
      data: {
        images: result.rows
      }
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// GET /api/accommodations/categories - Fetch distinct accommodation types
const getAccommodationCategories = async (req, res) => {
  try {
    const query = `
      SELECT DISTINCT type 
      FROM accommodations 
      WHERE is_active = true 
      ORDER BY type DESC
    `;

    const result = await pool.query(query);

    res.status(200).json({
      status: "success",
      data: {
        categories: result.rows.map(r => r.type)
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};


// POST /api/accommodations - Create new accommodation (admin only)
const createAccommodation = async (req, res) => {
  try {
    const {
      name,
      slug,
      type,
      description,
      address,
      city,
      state_province,
      country,
      postal_code,
      latitude,
      longitude,
      rating,
      base_price_per_night,
      currency,
      total_capacity,
      total_bedrooms,
      total_bathrooms,
      check_in_time,
      check_out_time,
      minimum_stay,
      maximum_stay
    } = req.body;

    const query = `
      INSERT INTO accommodations (
        name, slug, type, description, address, city, state_province, country,
        postal_code, latitude, longitude, rating, base_price_per_night, currency,
        total_capacity, total_bedrooms, total_bathrooms, check_in_time, check_out_time,
        minimum_stay, maximum_stay
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `;

    const values = [
      name, slug, type, description, address, city, state_province, country,
      postal_code, latitude, longitude, rating, base_price_per_night, currency,
      total_capacity, total_bedrooms, total_bathrooms, check_in_time, check_out_time,
      minimum_stay, maximum_stay
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      status: 'success',
      data: {
        accommodation: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error creating accommodation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// PUT /api/accommodations/:id - Update accommodation (admin only)
const updateAccommodation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    const allowedFields = [
      'name', 'slug', 'type', 'description', 'address', 'city', 'state_province',
      'country', 'postal_code', 'latitude', 'longitude', 'rating', 'base_price_per_night',
      'currency', 'total_capacity', 'total_bedrooms', 'total_bathrooms', 'check_in_time',
      'check_out_time', 'minimum_stay', 'maximum_stay', 'is_active'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex}`);
        values.push(req.body[field]);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid fields to update'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE accommodations 
      SET ${updateFields.join(', ')}
      WHERE accommodation_id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Accommodation not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        accommodation: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Error updating accommodation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

// DELETE /api/accommodations/:id - Delete accommodation (admin only)
const deleteAccommodation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM accommodations WHERE accommodation_id = $1 RETURNING accommodation_id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Accommodation not found'
      });
    }

    res.status(204).json({
      status: 'success',
      data: null
    });

  } catch (error) {
    console.error('Error deleting accommodation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllAccommodations,
  getAccommodationBySlug,
  getAccommodationRoomTypes,
  getAccommodationAmenities,
  getAccommodationImages,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationCategories
};