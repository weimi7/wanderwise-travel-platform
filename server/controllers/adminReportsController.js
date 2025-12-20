'use strict';
const pool = require('../config/db');

/**
 * Utility: convert rows + headers to CSV string
 */
function rowsToCsv(headers, rows) {
  const escapeCell = (v) => {
    if (v === null || v === undefined) return '';
    let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    s = s.replace(/"/g, '""');
    if (s.search(/("|,|\n|\r)/g) >= 0) s = `"${s}"`;
    return s;
  };

  const lines = [];
  lines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
  rows.forEach(r => {
    const line = headers.map(h => escapeCell(r[h])).join(',');
    lines.push(line);
  });
  return lines.join('\n');
}

/**
 * GET /api/admin/reports/users
 * Exports non-admin users (or filtered by role query param)
 * Query:
 *   role - optional (default: all non-admins)
 */
const exportUsersReport = async (req, res) => {
  try {
    const roleFilter = req.query.role;
    let q = `SELECT id, full_name, email, phone, country, role, created_at, updated_at FROM users`;
    const params = [];
    if (roleFilter) {
      q += ` WHERE role = $1`;
      params.push(roleFilter);
    } else {
      q += ` WHERE role != 'admin'`;
    }
    q += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(q, params);

    const headers = ['id','full_name','email','phone','country','role','created_at','updated_at'];
    const csv = rowsToCsv(headers, rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="users_report_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('❌ exportUsersReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to export users report' });
  }
};

/**
 * GET /api/admin/reports/bookings
 * Exports bookings with optional filters
 * Query:
 *   status, payment_status, booking_type, date_from, date_to
 */
const exportBookingsReport = async (req, res) => {
  try {
    const { status, payment_status, booking_type, date_from, date_to } = req.query;
    const clauses = [];
    const params = [];

    if (status) { params.push(status); clauses.push(`b.status = $${params.length}`); }
    if (payment_status) { params.push(payment_status); clauses.push(`b.payment_status = $${params.length}`); }
    if (booking_type) { params.push(booking_type); clauses.push(`b.booking_type = $${params.length}`); }
    if (date_from) { params.push(date_from); clauses.push(`b.created_at::date >= $${params.length}`); }
    if (date_to) { params.push(date_to); clauses.push(`b.created_at::date <= $${params.length}`); }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    const q = `
      SELECT b.booking_id, b.user_id, u.full_name AS user_name, b.contact_email, b.contact_phone,
             b.booking_type, b.reference_id, b.start_date, b.end_date, b.quantity, b.guests,
             b.total_amount, b.currency, b.payment_method, b.payment_status, b.status, b.created_at
      FROM bookings b
      LEFT JOIN users u ON u.id = b.user_id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT 10000
    `;
    const { rows } = await pool.query(q, params);

    const headers = [
      'booking_id','user_id','user_name','contact_email','contact_phone',
      'booking_type','reference_id','start_date','end_date','quantity','guests',
      'total_amount','currency','payment_method','payment_status','status','created_at'
    ];
    const csv = rowsToCsv(headers, rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="bookings_report_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('❌ exportBookingsReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to export bookings report' });
  }
};

/**
 * GET /api/admin/reports/revenue
 * Export revenue summaries:
 *  - monthly totals for the last N months (query months, default 12)
 *  - totals by booking_type
 *
 * Query:
 *   months (optional, default 12)
 */
const exportRevenueReport = async (req, res) => {
  try {
    const months = Math.min(60, Math.max(1, parseInt(req.query.months || '12', 10)));
    // monthly aggregation
    const trendQ = `
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', now()) - ($1::int - 1) * interval '1 month',
          date_trunc('month', now()),
          interval '1 month'
        ) AS month_start
      ),
      agg AS (
        SELECT date_trunc('month', created_at) AS month,
               COALESCE(SUM(total_amount),0)::numeric(14,2) AS revenue
        FROM bookings
        WHERE created_at >= date_trunc('month', now()) - ($1::int - 1) * interval '1 month'
        GROUP BY date_trunc('month', created_at)
      )
      SELECT to_char(m.month_start, 'YYYY-MM') AS month_key,
             to_char(m.month_start, 'Mon YYYY') AS month_label,
             COALESCE(a.revenue, 0)::numeric(14,2) AS revenue
      FROM months m
      LEFT JOIN agg a ON date_trunc('month', m.month_start) = a.month
      ORDER BY m.month_start;
    `;
    const trendRes = await pool.query(trendQ, [months]);

    // totals by booking type
    const byTypeQ = `
      SELECT COALESCE(booking_type, 'other') AS booking_type, COALESCE(SUM(total_amount),0)::numeric(14,2) AS revenue
      FROM bookings
      GROUP BY COALESCE(booking_type, 'other')
      ORDER BY revenue DESC
    `;
    const byTypeRes = await pool.query(byTypeQ);

    // build CSV with two sections separated by blank line
    const trendHeaders = ['month_key','month_label','revenue'];
    const trendCsv = rowsToCsv(trendHeaders, trendRes.rows);

    const typeHeaders = ['booking_type','revenue'];
    const typeCsv = rowsToCsv(typeHeaders, byTypeRes.rows);

    const csv = `# Monthly Revenue (last ${months} months)\n${trendCsv}\n\n# Revenue by booking type\n${typeCsv}`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="revenue_report_${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    console.error('❌ exportRevenueReport error:', err);
    res.status(500).json({ success: false, message: 'Failed to export revenue report' });
  }
};

module.exports = {
  exportUsersReport,
  exportBookingsReport,
  exportRevenueReport
};