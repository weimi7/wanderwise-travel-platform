'use strict';
const pool = require('../config/db');

// Normalize type helper
const normalizeType = (type) => {
  if (! type) return null;
  return type.endsWith('s') ? type.slice(0, -1).toLowerCase() : type.toLowerCase();
};

// Helper to coerce to integer safely
const toInt = (v, fallback = null) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};

// Helper to insert an audit log (uses provided client)
const insertAuditLog = async (client, {
  actorId = null,
  actorName = null,
  action,
  reviewIds = [],
  reviewableType = null,
  details = null
}) => {
  // Ensure reviewIds is an array of ints (or empty array)
  const normalizedIds = Array.isArray(reviewIds) 
    ? reviewIds.map((i) => (i == null ? null : parseInt(i, 10))).filter((x) => Number.isFinite(x)) 
    : [];

  // details:  pass JS object/null — let pg driver send proper json when column is json/jsonb
  const q = `
    INSERT INTO audit_logs (actor_id, actor_name, action, review_ids, reviewable_type, details)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const params = [
    actorId, 
    actorName, 
    action, 
    normalizedIds. length ?  normalizedIds : null, 
    reviewableType, 
    details || null
  ];
  const res = await client.query(q, params);
  return res.rows[0];
};

// Admin:  list reviews with optional filters:  status, reviewable_type, reviewable_id, q (search), pagination
const listReviews = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📝 Admin Reviews List Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?. id || 'Unknown');
  console.log('🔐 Role:', req.user?.role || 'Unknown');
  console.log('📝 Query params:', req.query);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    const {
      status,
      reviewable_type,
      reviewable_id,
      q, // search query (title, body, author)
    } = req.query;

    // sanitize page & limit
    const page = Math.max(1, toInt(req.query.page, 1));
    const limit = Math. max(1, toInt(req.query.limit, 50));
    const offset = (page - 1) * limit;

    const clauses = [];
    const params = [];

    if (status) {
      params.push(status);
      clauses.push(`r.status = $${params.length}`);
    }

    if (reviewable_type) {
      params.push(normalizeType(reviewable_type));
      clauses.push(`r.reviewable_type = $${params.length}`);
    }

    if (reviewable_id) {
      const rid = toInt(reviewable_id);
      if (! Number.isFinite(rid)) {
        console.log('❌ Invalid reviewable_id');
        return res.status(400).json({ success: false, message: 'Invalid reviewable_id' });
      }
      params.push(rid);
      clauses.push(`r.reviewable_id = $${params.length}`);
    }

    if (q && q.trim() !== '') {
      // search title, body and author name
      params.push(`%${q.trim()}%`);
      clauses.push(`(r.title ILIKE $${params.length} OR r.body ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }

    const whereClause = clauses.length ?  `WHERE ${clauses.join(' AND ')}` : '';

    console.log('🔍 WHERE clause:', whereClause);
    console.log('📊 Query params:', params);

    // total count for pagination (include user join since q may reference u.full_name)
    const countQuery = `SELECT COUNT(*) FROM reviews r LEFT JOIN users u ON u.id = r.user_id ${whereClause}`;
    const countRes = await pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0]. count, 10);

    console.log(`📈 Total records: ${total}`);

    const dataQuery = `
      SELECT r.review_id, r.reviewable_type, r.reviewable_id, r.user_id, r.rating, r.title, r.body, r.status, r.created_at,
             u.id AS author_id, u.full_name AS author_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const dataParams = [... params, limit, offset];
    const { rows } = await pool.query(dataQuery, dataParams);

    console.log(`✅ Retrieved ${rows.length} reviews`);
    console.log('='.repeat(60) + '\n');

    res.status(200).json({
      success: true,
      reviews: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('❌ Error listing reviews (admin):');
    console.error('Error name:', err.name);
    console.error('Error message:', err. message);
    console.error('Error stack:', err.stack);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to list reviews',
      error:  process.env.NODE_ENV === 'development' ? err.message :  undefined
    });
  }
};

// Admin: set review status to published (single)
const publishReview = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Admin Publish Review Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?.id || 'Unknown');
  console.log('🆔 Review ID:', req.params.reviewId);

  const client = await pool.connect();
  try {
    const { reviewId } = req.params;
    const reviewIdInt = toInt(reviewId);
    if (!Number.isFinite(reviewIdInt)) {
      console.log('❌ Invalid reviewId');
      return res.status(400).json({ success: false, message: 'Invalid reviewId' });
    }

    const actor = req.user || null;

    await client.query('BEGIN');

    // fetch current row to inspect status
    const curRes = await client.query('SELECT * FROM reviews WHERE review_id = $1 LIMIT 1', [reviewIdInt]);
    if (curRes.rows.length === 0) {
      await client.query('ROLLBACK');
      console.log('❌ Review not found');
      console.log('='.repeat(60) + '\n');
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const current = curRes.rows[0];
    // Prevent publishing a review that was explicitly rejected
    if (String(current.status).toLowerCase() === 'rejected') {
      await client.query('ROLLBACK');
      console.log('❌ Cannot publish rejected review');
      console.log('='. repeat(60) + '\n');
      return res.status(400).json({ success: false, message: 'Cannot publish a rejected review' });
    }

    const update = await client.query(
      `UPDATE reviews SET status = 'published' WHERE review_id = $1 RETURNING *`,
      [reviewIdInt]
    );

    if (update.rows.length === 0) {
      await client.query('ROLLBACK');
      console.log('❌ Review not found for update');
      console.log('='.repeat(60) + '\n');
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Insert audit log in same transaction
    const updated = update.rows[0];
    await insertAuditLog(client, {
      actorId: actor?. id || null,
      actorName: actor?.full_name || actor?.name || null,
      action: 'publish',
      reviewIds: [updated.review_id],
      reviewableType: updated.reviewable_type,
      details: { single: true }
    });

    await client.query('COMMIT');

    console.log('✅ Review published successfully');
    console.log('='.repeat(60) + '\n');

    res.status(200).json({ success: true, review: updated });
  } catch (err) {
    await client. query('ROLLBACK').catch(() => {});
    console.error('❌ Error publishing review:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to publish review',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client. release();
  }
};

// Admin: set review status to rejected (single)
const rejectReview = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('❌ Admin Reject Review Request');
  console.log('='. repeat(60));
  console.log('👤 User:', req.user?.id || 'Unknown');
  console.log('🆔 Review ID:', req. params.reviewId);

  const client = await pool.connect();
  try {
    const { reviewId } = req.params;
    const reviewIdInt = toInt(reviewId);
    if (!Number.isFinite(reviewIdInt)) {
      console.log('❌ Invalid reviewId');
      return res.status(400).json({ success: false, message: 'Invalid reviewId' });
    }

    const actor = req.user || null;

    await client.query('BEGIN');

    const update = await client.query(
      `UPDATE reviews SET status = 'rejected' WHERE review_id = $1 RETURNING *`,
      [reviewIdInt]
    );

    if (update.rows. length === 0) {
      await client.query('ROLLBACK');
      console.log('❌ Review not found');
      console.log('='.repeat(60) + '\n');
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const updated = update.rows[0];
    await insertAuditLog(client, {
      actorId: actor?.id || null,
      actorName: actor?.full_name || actor?.name || null,
      action: 'reject',
      reviewIds: [updated.review_id],
      reviewableType: updated.reviewable_type,
      details: { single: true }
    });

    await client.query('COMMIT');

    console.log('✅ Review rejected successfully');
    console.log('='.repeat(60) + '\n');

    res.status(200).json({ success: true, review: updated });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error rejecting review:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject review',
      error: process.env.NODE_ENV === 'development' ? err.message :  undefined
    });
  } finally {
    client.release();
  }
};

// Admin:  bulk update reviews (publish or reject many reviews)
const bulkUpdateReviews = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📦 Admin Bulk Update Reviews Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?.id || 'Unknown');
  console.log('📝 Body:', req.body);

  const client = await pool.connect();
  try {
    const { action, ids } = req. body;
    const actor = req.user || null;

    if (! action || !['publish', 'reject'].includes(action)) {
      console.log('❌ Invalid action');
      return res.status(400).json({ success: false, message:  'Invalid action.  Use "publish" or "reject".' });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      console.log('❌ Invalid ids array');
      return res.status(400).json({ success: false, message: 'ids must be a non-empty array of review IDs.' });
    }

    // sanitize ids to integers
    const intIds = ids.map((i) => parseInt(i, 10)).filter((n) => Number.isFinite(n));
    if (intIds.length === 0) {
      console.log('❌ No valid integer IDs');
      return res.status(400).json({ success: false, message: 'ids must contain at least one valid integer ID.' });
    }

    console.log(`📊 Processing ${intIds.length} reviews with action: ${action}`);

    await client.query('BEGIN');

    if (action === 'publish') {
      // fetch current statuses and skip rejected items
      const cur = await client.query('SELECT review_id, status FROM reviews WHERE review_id = ANY($1:: int[])', [intIds]);
      const rejectedIds = cur.rows.filter(r => String(r.status).toLowerCase() === 'rejected').map(r => r.review_id);
      const publishIds = cur.rows.filter(r => String(r.status).toLowerCase() !== 'rejected').map(r => r.review_id);

      console.log(`📊 Publishable:  ${publishIds.length}, Skipped (rejected): ${rejectedIds.length}`);

      let updatedRows = [];
      if (publishIds.length) {
        const updateRes = await client.query(
          `UPDATE reviews SET status = 'published' WHERE review_id = ANY($1::int[]) RETURNING *`,
          [publishIds]
        );
        updatedRows = updateRes.rows || [];
      }

      // Insert audit log summarizing the bulk action
      await insertAuditLog(client, {
        actorId: actor?.id || null,
        actorName: actor?. full_name || actor?.name || null,
        action: `bulk_publish`,
        reviewIds: updatedRows.map(r => r.review_id),
        reviewableType: null,
        details: { count: updatedRows.length, skippedRejected: rejectedIds }
      });

      await client. query('COMMIT');

      console.log(`✅ Bulk publish completed:  ${updatedRows.length} published`);
      console.log('='.repeat(60) + '\n');

      res.status(200).json({
        success: true,
        updatedCount: updatedRows.length,
        reviews: updatedRows,
        skippedRejected: rejectedIds
      });
      return;
    }

    // reject path
    const updateRes = await client.query(
      `UPDATE reviews SET status = 'rejected' WHERE review_id = ANY($1::int[]) RETURNING *`,
      [intIds]
    );

    const updatedRows = updateRes.rows || [];
    const updatedIds = updatedRows.map(r => r.review_id);
    const typeCounts = updatedRows.reduce((acc, r) => {
      const t = r.reviewable_type || 'unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    await insertAuditLog(client, {
      actorId: actor?.id || null,
      actorName: actor?.full_name || actor?.name || null,
      action: `bulk_reject`,
      reviewIds: updatedIds,
      reviewableType: null,
      details: { count:  updatedIds.length, types: typeCounts }
    });

    await client.query('COMMIT');

    console.log(`✅ Bulk reject completed: ${updatedRows.length} rejected`);
    console.log('='.repeat(60) + '\n');

    res.status(200).json({
      success: true,
      updatedCount: updatedRows. length,
      reviews: updatedRows,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('❌ Error bulk updating reviews:');
    console.error('Error name:', err.name);
    console.error('Error message:', err. message);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message:  'Failed to perform bulk update',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
};

module.exports = {
  listReviews,
  publishReview,
  rejectReview,
  bulkUpdateReviews,
};