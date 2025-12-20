'use strict';
const pool = require('../config/db');

/**
 * POST /api/users/favorites
 * Body: { favorite_type: 'accommodation'|'activity'|'destination', reference_id, reference_slug?, meta? }
 * Requires requireAuth middleware (req.user)
 */
const addFavorite = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { favorite_type, reference_id, reference_slug = null, meta = null } = req.body;
    if (!favorite_type || !reference_id) {
      return res.status(400).json({ success: false, message: 'favorite_type and reference_id are required' });
    }

    // Prevent duplicates: check existing
    const existQ = `SELECT favorite_id FROM user_favorites WHERE user_id = $1 AND favorite_type = $2 AND reference_id = $3 LIMIT 1`;
    const existRes = await pool.query(existQ, [user.id, favorite_type, reference_id]);
    if (existRes.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Already favorited', favorite: existRes.rows[0] });
    }

    const q = `
      INSERT INTO user_favorites (user_id, favorite_type, reference_id, reference_slug, meta)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING favorite_id, user_id, favorite_type, reference_id, reference_slug, meta, created_at
    `;
    const values = [user.id, favorite_type, reference_id, reference_slug, meta ? JSON.stringify(meta) : null];
    const { rows } = await pool.query(q, values);

    res.status(201).json({ success: true, favorite: rows[0] });
  } catch (err) {
    console.error('❌ addFavorite error:', err);
    res.status(500).json({ success: false, message: 'Failed to add favorite' });
  }
};

/**
 * DELETE /api/users/favorites
 * Query params: favorite_type & reference_id  OR id (favorite_id)
 * Requires requireAuth
 */
const removeFavorite = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    const { favorite_type, reference_id } = req.query;

    let q, params;
    if (id) {
      q = `DELETE FROM user_favorites WHERE favorite_id = $1 AND user_id = $2 RETURNING favorite_id`;
      params = [id, user.id];
    } else if (favorite_type && reference_id) {
      q = `DELETE FROM user_favorites WHERE favorite_type = $1 AND reference_id = $2 AND user_id = $3 RETURNING favorite_id`;
      params = [favorite_type, reference_id, user.id];
    } else {
      return res.status(400).json({ success: false, message: 'Provide id or favorite_type + reference_id' });
    }

    const r = await pool.query(q, params);
    if (r.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }
    res.status(200).json({ success: true, message: 'Removed', favorite_id: r.rows[0].favorite_id });
  } catch (err) {
    console.error('❌ removeFavorite error:', err);
    res.status(500).json({ success: false, message: 'Failed to remove favorite' });
  }
};

/**
 * GET /api/users/favorites
 * Query: page, limit (optional)
 * Returns: user's favorites, most recent first
 */
const listFavorites = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, Math.max(10, parseInt(req.query.limit || '50', 10)));
    const offset = (page - 1) * limit;

    const q = `
      SELECT favorite_id, favorite_type, reference_id, reference_slug, meta, created_at
      FROM user_favorites
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const params = [user.id, limit, offset];
    const { rows } = await pool.query(q, params);

    // Count total
    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM user_favorites WHERE user_id = $1', [user.id]);
    const total = countRes.rows[0].total;

    res.status(200).json({
      success: true,
      favorites: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('❌ listFavorites error:', err);
    res.status(500).json({ success: false, message: 'Failed to list favorites' });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  listFavorites
};