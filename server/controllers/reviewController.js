'use strict';
const pool = require('../config/db');

// Normalize type helper (strip trailing 's' if passed as plural)
const normalizeType = (type) => {
  if (!type) return null;
  return type.endsWith('s') ? type.slice(0, -1).toLowerCase() : type.toLowerCase();
};

// helper to cast ints
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

// ------------------------------------------------------------------
// Helper: augment reviews with helpful_count (upvotes - downvotes),
// up_count, down_count and optionally whether the current user voted.
// ------------------------------------------------------------------
async function attachVoteCounts(reviews, currentUserId = null) {
  if (!Array.isArray(reviews) || reviews.length === 0) return reviews;
  const ids = reviews.map(r => r.review_id).filter(Boolean);
  if (ids.length === 0) return reviews;

  const q = `
    SELECT review_id,
      SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END)::int AS up_count,
      SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END)::int AS down_count
    FROM helpful_votes
    WHERE review_id = ANY($1::int[])
    GROUP BY review_id
  `;
  const { rows } = await pool.query(q, [ids]);

  const map = {};
  rows.forEach(r => {
    map[r.review_id] = {
      up_count: Number(r.up_count || 0),
      down_count: Number(r.down_count || 0),
      helpful_count: Number((r.up_count || 0) - (r.down_count || 0))
    };
  });

  // If we need current user's vote
  let userVotesMap = {};
  if (currentUserId) {
    const uvq = `SELECT review_id, vote FROM helpful_votes WHERE review_id = ANY($1::int[]) AND user_id = $2`;
    const uv = await pool.query(uvq, [ids, currentUserId]);
    uv.rows.forEach(r => {
      userVotesMap[r.review_id] = Number(r.vote);
    });
  }

  return reviews.map(r => {
    const stats = map[r.review_id] || { up_count: 0, down_count: 0, helpful_count: 0 };
    return {
      ...r,
      up_count: stats.up_count || 0,
      down_count: stats.down_count || 0,
      helpful_count: stats.helpful_count || 0,
      my_vote: currentUserId ? (userVotesMap[r.review_id] || 0) : 0
    };
  });
}

// -------------------------
// GET public reviews for an item (only published)
// now includes helpful counts and a small author payload
// -------------------------
const getPublicReviews = async (req, res) => {
  try {
    const typeParam = req.params.type || req.query.reviewable_type;
    const idParam = req.params.id || req.query.reviewable_id;

    const reviewable_type = normalizeType(typeParam);
    const reviewable_id = toInt(idParam);

    if (!reviewable_type || !reviewable_id) {
      return res.status(400).json({ success: false, message: 'reviewable_type and reviewable_id are required' });
    }

    const query = `
      SELECT r.review_id, r.rating, r.title, r.body AS content, r.status, r.created_at,
             r.user_id,
             u.id AS author_id, u.full_name AS author_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.reviewable_type = $1 AND r.reviewable_id = $2 AND r.status = 'published'
      ORDER BY r.created_at DESC
    `;

    const { rows } = await pool.query(query, [reviewable_type, reviewable_id]);
    const list = await attachVoteCounts(rows, null);
    res.status(200).json({ success: true, reviews: list || [] });
  } catch (err) {
    console.error('❌ Error fetching public reviews:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
};

// -------------------------
// POST add review (inserts with status 'pending')
// -------------------------
const addReview = async (req, res) => {
  try {
    const typeParam = req.params.type || req.query.reviewable_type;
    const idParam = req.params.id || req.query.reviewable_id;

    const reviewable_type = normalizeType(typeParam);
    const reviewable_id = toInt(idParam);

    if (!reviewable_type || !reviewable_id) {
      return res.status(400).json({ success: false, message: 'reviewable_type and reviewable_id are required' });
    }

    const { rating, title, body } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5' });
    }

    // Expect req.user.id (uuid) from your requireAuth middleware; null if anonymous allowed
    const userId = req.user?.id || null;

    const insertQuery = `
      INSERT INTO reviews (reviewable_type, reviewable_id, user_id, rating, title, body, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING review_id, reviewable_type, reviewable_id, user_id, rating, title, body AS content, status, created_at
    `;

    const { rows } = await pool.query(insertQuery, [
      reviewable_type,
      reviewable_id,
      userId,
      rating,
      title || null,
      body || null
    ]);

    const inserted = rows[0];

    // Attach author info if userId exists
    let author = null;
    if (userId) {
      const u = await pool.query('SELECT id AS author_id, full_name AS author_name FROM users WHERE id = $1 LIMIT 1', [userId]);
      author = u.rows[0] || null;
    }

    // Include vote counts
    const enriched = (await attachVoteCounts([inserted], userId))[0];

    res.status(201).json({ success: true, review: { ...enriched, author } });
  } catch (err) {
    console.error('❌ Error adding review:', err);
    res.status(500).json({ success: false, message: 'Failed to add review' });
  }
};

// -------------------------
// GET /api/reviews/mine
// include helpful counts and my_vote
// -------------------------
const getUserReviews = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const offset = (page - 1) * limit;

    const q = `
      SELECT review_id, reviewable_type, reviewable_id, user_id, rating, title, body AS content, status, created_at, updated_at
      FROM reviews
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const params = [user.id, limit, offset];
    const { rows } = await pool.query(q, params);

    const listWithVotes = await attachVoteCounts(rows, user.id);

    const countRes = await pool.query('SELECT COUNT(*)::int AS total FROM reviews WHERE user_id = $1', [user.id]);
    const total = countRes.rows[0].total;

    res.status(200).json({
      success: true,
      reviews: listWithVotes,
      pagination: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('❌ getUserReviews error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user reviews' });
  }
};

// -------------------------
// PUT /api/reviews/:id
// Update a review (owner only). Disallow edits for 'published'.
// -------------------------
const updateReview = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Review id required' });

    const { rows } = await pool.query('SELECT * FROM reviews WHERE review_id = $1 LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Review not found' });

    const review = rows[0];

    if (review.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed to edit this review' });
    }

    if (review.status === 'published') {
      return res.status(400).json({ success: false, message: 'Published reviews cannot be edited' });
    }

    const { title, rating, content } = req.body;

    // Validate rating if provided
    if (rating !== undefined) {
      const r = Number(rating);
      if (!Number.isFinite(r) || r < 1 || r > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be a number between 1 and 5' });
      }
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      params.push(title || null);
    }
    if (rating !== undefined) {
      fields.push(`rating = $${idx++}`);
      params.push(Number(rating));
    }
    if (content !== undefined) {
      fields.push(`body = $${idx++}`);
      params.push(content || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    fields.push(`updated_at = $${idx++}`);
    params.push(new Date());
    params.push(id); // WHERE param

    const sql = `UPDATE reviews SET ${fields.join(', ')} WHERE review_id = $${idx} RETURNING review_id, reviewable_type, reviewable_id, user_id, rating, title, body AS content, status, created_at, updated_at`;
    const { rows: updatedRows } = await pool.query(sql, params);
    const updated = updatedRows[0];

    // include vote counts for updated result
    const enriched = (await attachVoteCounts([updated], user.id))[0];

    res.status(200).json({ success: true, review: enriched });
  } catch (err) {
    console.error('❌ updateReview error:', err);
    res.status(500).json({ success: false, message: 'Failed to update review' });
  }
};

// -------------------------
// Vote endpoint: POST /api/reviews/:id/vote
// body: { vote: 'up'|'down'|'remove' }
// Requires auth. Toggles/updates vote, returns new counts & my_vote
// -------------------------
const voteReview = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const reviewId = toInt(req.params.id);
    if (!reviewId) return res.status(400).json({ success: false, message: 'Invalid review id' });

    const { vote } = req.body;
    if (!['up', 'down', 'remove'].includes(vote)) {
      return res.status(400).json({ success: false, message: 'vote must be "up", "down" or "remove"' });
    }

    // compute numeric
    let numeric = 0;
    if (vote === 'up') numeric = 1;
    else if (vote === 'down') numeric = -1;

    // Insert or update unique row (review_id,user_id)
    if (vote === 'remove') {
      await pool.query('DELETE FROM helpful_votes WHERE review_id = $1 AND user_id = $2', [reviewId, user.id]);
    } else {
      const upsert = `
        INSERT INTO helpful_votes (review_id, user_id, vote)
        VALUES ($1, $2, $3)
        ON CONFLICT (review_id, user_id) DO UPDATE SET vote = EXCLUDED.vote, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `;
      await pool.query(upsert, [reviewId, user.id, numeric]);
    }

    // return updated counts and user's vote
    const countsQ = `
      SELECT
        SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END)::int AS up_count,
        SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END)::int AS down_count
      FROM helpful_votes WHERE review_id = $1
    `;
    const cRes = await pool.query(countsQ, [reviewId]);
    const up_count = Number(cRes.rows[0].up_count || 0);
    const down_count = Number(cRes.rows[0].down_count || 0);
    const helpful_count = up_count - down_count;

    const myVoteRes = await pool.query('SELECT vote FROM helpful_votes WHERE review_id = $1 AND user_id = $2', [reviewId, user.id]);
    const my_vote = myVoteRes.rows[0] ? Number(myVoteRes.rows[0].vote) : 0;

    res.json({ success: true, up_count, down_count, helpful_count, my_vote });
  } catch (err) {
    console.error('❌ voteReview error:', err);
    res.status(500).json({ success: false, message: 'Failed to register vote' });
  }
};

// -------------------------
// GET votes details for a review: GET /api/reviews/:id/votes
// Returns counts and, if requester is review owner or admin, list of voter ids (and optionally names)
// -------------------------
const getReviewVotes = async (req, res) => {
  try {
    const user = req.user || null;
    const reviewId = toInt(req.params.id);
    if (!reviewId) return res.status(400).json({ success: false, message: 'Invalid review id' });

    const countsQ = `
      SELECT
        SUM(CASE WHEN vote = 1 THEN 1 ELSE 0 END)::int AS up_count,
        SUM(CASE WHEN vote = -1 THEN 1 ELSE 0 END)::int AS down_count
      FROM helpful_votes WHERE review_id = $1
    `;
    const cRes = await pool.query(countsQ, [reviewId]);
    const up_count = Number(cRes.rows[0].up_count || 0);
    const down_count = Number(cRes.rows[0].down_count || 0);

    // Do we include voters list? Only if requester is owner or admin
    let voters = null;
    if (user) {
      const rRes = await pool.query('SELECT user_id FROM reviews WHERE review_id = $1 LIMIT 1', [reviewId]);
      const ownerId = rRes.rows[0] ? rRes.rows[0].user_id : null;
      if (ownerId === user.id || user.role === 'admin') {
        // join to users for names
        const vq = `
          SELECT hv.user_id, hv.vote, u.full_name
          FROM helpful_votes hv
          LEFT JOIN users u ON u.id = hv.user_id
          WHERE hv.review_id = $1
        `;
        const vr = await pool.query(vq, [reviewId]);
        voters = vr.rows || [];
      }
    }

    res.json({ success: true, up_count, down_count, helpful_count: up_count - down_count, voters });
  } catch (err) {
    console.error('❌ getReviewVotes error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch vote info' });
  }
};

// -------------------------
// POST reply to a review: POST /api/reviews/:id/replies
// body: { content }
// requires auth
// -------------------------
const postReply = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const reviewId = toInt(req.params.id);
    if (!reviewId) return res.status(400).json({ success: false, message: 'Invalid review id' });

    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Reply content required' });

    const insertQ = `
      INSERT INTO review_replies (review_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING reply_id, review_id, user_id, content, created_at, updated_at
    `;
    const r = await pool.query(insertQ, [reviewId, user.id, content.trim()]);
    const reply = r.rows[0];

    // attach author name
    const ures = await pool.query('SELECT id AS user_id, full_name FROM users WHERE id = $1 LIMIT 1', [user.id]);
    const author = ures.rows[0] || null;

    res.status(201).json({ success: true, reply: { ...reply, author } });
  } catch (err) {
    console.error('❌ postReply error:', err);
    res.status(500).json({ success: false, message: 'Failed to post reply' });
  }
};

// -------------------------
// GET replies for review: GET /api/reviews/:id/replies
// public, returns replies (author name included)
// -------------------------
const getReplies = async (req, res) => {
  try {
    const reviewId = toInt(req.params.id);
    if (!reviewId) return res.status(400).json({ success: false, message: 'Invalid review id' });

    const q = `
      SELECT r.reply_id, r.review_id, r.user_id, r.content, r.created_at, r.updated_at,
             u.full_name AS author_name
      FROM review_replies r
      LEFT JOIN users u ON u.id = r.user_id
      WHERE r.review_id = $1
      ORDER BY r.created_at ASC
    `;
    const { rows } = await pool.query(q, [reviewId]);
    res.json({ success: true, replies: rows || [] });
  } catch (err) {
    console.error('❌ getReplies error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch replies' });
  }
};

module.exports = {
  getPublicReviews,
  addReview,
  getUserReviews,
  updateReview,
  voteReview,
  getReviewVotes,
  postReply,
  getReplies
};