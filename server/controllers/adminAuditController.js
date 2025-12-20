'use strict';
const pool = require('../config/db');

// Normalize type helper
const normalizeType = (type) => {
  if (! type) return null;
  return type.endsWith('s') ? type.slice(0, -1).toLowerCase() : type.toLowerCase();
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
  const detailsJson = details ? JSON.stringify(details) : null;
  const q = `
    INSERT INTO audit_logs (actor_id, actor_name, action, review_ids, reviewable_type, details)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const params = [actorId, actorName, action, reviewIds, reviewableType, detailsJson];
  const res = await client.query(q, params);
  return res.rows[0];
};

// Whitelist allowed sort columns to prevent SQL injection
const ALLOWED_SORT_COLUMNS = {
  audit_id: 'audit_logs.audit_id',
  created_at: 'audit_logs.created_at',
  action: 'audit_logs.action',
  actor_name: 'audit_logs.actor_name'
};

const parseSort = (sort_by, sort_order) => {
  const col = ALLOWED_SORT_COLUMNS[sort_by] || ALLOWED_SORT_COLUMNS. created_at;
  const order = (sort_order && sort_order.toLowerCase() === 'asc') ? 'ASC' : 'DESC';
  return { col, order };
};

// Admin:  list audit logs with filters, pagination and sorting
const listAuditLogs = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📋 Audit Logs List Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?. id || 'Unknown');
  console.log('🔐 Role:', req.user?.role || 'Unknown');
  console.log('📝 Query params:', req.query);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    const {
      action,
      reviewable_type,
      actor_name,
      q,
      date_from,
      date_to,
      page = 1,
      limit = 50,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const clauses = [];
    const params = [];

    if (action) {
      params.push(action);
      clauses.push(`action = $${params.length}`);
    }

    if (reviewable_type) {
      params.push(reviewable_type);
      clauses.push(`reviewable_type = $${params.length}`);
    }

    if (actor_name) {
      params.push(`%${actor_name}%`);
      clauses.push(`actor_name ILIKE $${params.length}`);
    }

    if (q && q.trim() !== '') {
      params.push(`%${q.trim()}%`);
      clauses.push(`(actor_name ILIKE $${params.length} OR action ILIKE $${params.length} OR details:: text ILIKE $${params. length})`);
    }

    if (date_from) {
      params.push(date_from);
      clauses.push(`created_at >= $${params.length}`);
    }
    if (date_to) {
      params.push(date_to);
      clauses.push(`created_at <= $${params.length}`);
    }

    const whereClause = clauses.length ?  `WHERE ${clauses.join(' AND ')}` : '';

    console.log('🔍 WHERE clause:', whereClause);
    console.log('📊 Query params:', params);

    // Count
    const countQuery = `SELECT COUNT(*) FROM audit_logs ${whereClause}`;
    const countRes = await pool.query(countQuery, params);
    const total = parseInt(countRes.rows[0]. count, 10);

    console.log(`📈 Total records: ${total}`);

    // Sorting
    const { col:  sortCol, order: sortOrderVal } = parseSort(sort_by, sort_order);

    console.log(`🔀 Sorting by: ${sortCol} ${sortOrderVal}`);

    const dataQuery = `
      SELECT audit_id, actor_id, actor_name, action, review_ids, reviewable_type, details, created_at
      FROM audit_logs
      ${whereClause}
      ORDER BY ${sortCol} ${sortOrderVal}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [... params, parseInt(limit, 10), offset];
    const dataRes = await pool. query(dataQuery, dataParams);

    console.log(`✅ Retrieved ${dataRes.rows.length} audit logs`);
    console.log('='.repeat(60) + '\n');

    res.status(200).json({
      success: true,
      logs: dataRes.rows,
      pagination: {
        total,
        page:  parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (err) {
    console.error('❌ Error listing audit logs (admin):');
    console.error('Error name:', err.name);
    console.error('Error message:', err. message);
    console.error('Error stack:', err.stack);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to list audit logs',
      error: process.env.NODE_ENV === 'development' ? err.message :  undefined
    });
  }
};

// GET /api/admin/audit-logs/:id
const getAuditLog = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📄 Audit Log Detail Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req. user?.id || 'Unknown');
  console.log('🆔 Audit ID:', req.params.id);

  try {
    const { id } = req.params;
    if (!id) {
      console.log('❌ No ID provided');
      return res.status(400).json({ success: false, message: 'id required' });
    }

    const q = `
      SELECT audit_id, actor_id, actor_name, action, review_ids, reviewable_type, details, created_at
      FROM audit_logs
      WHERE audit_id = $1
      LIMIT 1
    `;
    const r = await pool.query(q, [id]);
    
    if (r.rowCount === 0) {
      console.log('❌ Audit log not found');
      console.log('='.repeat(60) + '\n');
      return res.status(404).json({ success: false, message: 'Audit log not found' });
    }

    console.log('✅ Audit log retrieved');
    console.log('='.repeat(60) + '\n');

    res.status(200).json({ success: true, log: r.rows[0] });
  } catch (err) {
    console.error('❌ Error getting audit log: ');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to get audit log',
      error: process.env.NODE_ENV === 'development' ?  err.message : undefined
    });
  }
};

// Export audit logs as CSV (no pagination; applies the same filters + sorting)
const exportAuditLogs = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📥 Audit Logs Export Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?. id || 'Unknown');
  console.log('📝 Query params:', req.query);

  try {
    const {
      action,
      reviewable_type,
      actor_name,
      q,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = req.query;

    const clauses = [];
    const params = [];

    if (action) {
      params.push(action);
      clauses.push(`action = $${params.length}`);
    }

    if (reviewable_type) {
      params.push(reviewable_type);
      clauses.push(`reviewable_type = $${params.length}`);
    }

    if (actor_name) {
      params.push(`%${actor_name}%`);
      clauses.push(`actor_name ILIKE $${params.length}`);
    }

    if (q && q.trim() !== '') {
      params.push(`%${q.trim()}%`);
      clauses.push(`(actor_name ILIKE $${params.length} OR action ILIKE $${params.length} OR details::text ILIKE $${params.length})`);
    }

    if (date_from) {
      params.push(date_from);
      clauses.push(`created_at >= $${params.length}`);
    }
    if (date_to) {
      params.push(date_to);
      clauses.push(`created_at <= $${params.length}`);
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    // Sorting
    const { col: sortCol, order: sortOrderVal } = parseSort(sort_by, sort_order);

    const dataQuery = `
      SELECT audit_id, actor_id, actor_name, action, review_ids, reviewable_type, details, created_at
      FROM audit_logs
      ${whereClause}
      ORDER BY ${sortCol} ${sortOrderVal}
    `;
    const dataRes = await pool.query(dataQuery, params);
    const rows = dataRes.rows || [];

    console.log(`✅ Exporting ${rows.length} audit logs`);

    // Build CSV
    // Header
    const headers = ['audit_id', 'actor_id', 'actor_name', 'action', 'review_ids', 'reviewable_type', 'details', 'created_at'];
    const escapeCell = (v) => {
      if (v === null || v === undefined) return '';
      let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
      // Escape double quotes
      s = s.replace(/"/g, '""');
      // wrap in quotes if contains comma/newline/quote
      if (s.search(/("|,|\n|\r)/g) >= 0) {
        s = `"${s}"`;
      }
      return s;
    };

    const csvRows = [headers.join(',')];
    rows.forEach((r) => {
      const line = [
        escapeCell(r.audit_id),
        escapeCell(r.actor_id),
        escapeCell(r.actor_name),
        escapeCell(r.action),
        escapeCell(r.review_ids),
        escapeCell(r.reviewable_type),
        escapeCell(r.details),
        escapeCell(r.created_at)
      ].join(',');
      csvRows.push(line);
    });

    const csv = csvRows.join('\n');

    console.log('✅ CSV generated successfully');
    console.log('='.repeat(60) + '\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('❌ Error exporting audit logs:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to export audit logs',
      error: process.env.NODE_ENV === 'development' ? err.message :  undefined
    });
  }
};

module.exports = {
  listAuditLogs,
  getAuditLog,
  exportAuditLogs,
  insertAuditLog
};