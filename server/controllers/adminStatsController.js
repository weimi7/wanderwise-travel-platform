'use strict';
const pool = require('../config/db');

/**
 * GET /api/admin/stats
 * Returns aggregated dashboard stats for admin: 
 * - totals: users, bookings, revenue, accommodations
 * - bookingsTrend: last 12 months { key, month, bookings, revenue }
 * - revenueBreakdown: aggregated by booking_type [{ name, value }]
 * - recentBookings: latest N bookings with minimal fields
 *
 * Requires requireAdmin middleware when registering the route. 
 */
const getAdminStats = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Admin Stats Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?.id || 'Unknown');
  console.log('🔐 Role:', req.user?.role || 'Unknown');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    console.log('📋 Fetching totals...');
    
    // Totals
    const [
      usersRes,
      bookingsCountRes,
      revenueRes,
      accommodationsRes
    ] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM users'),
      pool.query('SELECT COUNT(*)::int AS total FROM bookings'),
      pool.query('SELECT COALESCE(SUM(total_amount),0)::numeric(14,2) AS total FROM bookings'),
      pool.query('SELECT COUNT(*)::int AS total FROM accommodations WHERE is_active = true')
    ]);

    const totals = {
      users: parseInt(usersRes.rows[0].total, 10),
      bookings: parseInt(bookingsCountRes.rows[0].total, 10),
      revenue: parseFloat(revenueRes.rows[0]. total), // numeric -> float
      accommodations: parseInt(accommodationsRes.rows[0]. total, 10)
    };

    console.log('✅ Totals retrieved:', totals);
    console.log('📈 Fetching bookings trend...');

    // Bookings trend - last 12 months (include months with zero)
    const trendQ = `
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', now()) - interval '11 months',
          date_trunc('month', now()),
          interval '1 month'
        ) AS month_start
      ),
      agg AS (
        SELECT date_trunc('month', created_at) AS month,
               COUNT(*)::int AS bookings,
               COALESCE(SUM(total_amount),0)::numeric(14,2) AS revenue
        FROM bookings
        WHERE created_at >= date_trunc('month', now()) - interval '11 months'
        GROUP BY date_trunc('month', created_at)
      )
      SELECT to_char(m. month_start, 'YYYY-MM') AS key,
             to_char(m.month_start, 'Mon') AS month,
             COALESCE(a.bookings, 0) AS bookings,
             COALESCE(a.revenue, 0)::numeric(14,2) AS revenue
      FROM months m
      LEFT JOIN agg a ON date_trunc('month', m. month_start) = a.month
      ORDER BY m. month_start;
    `;
    const trendRes = await pool.query(trendQ);

    const bookingsTrend = trendRes.rows.map(r => ({
      key: r. key,
      month: r. month,
      bookings: parseInt(r.bookings, 10),
      revenue: parseFloat(r.revenue)
    }));

    console.log(`✅ Bookings trend retrieved: ${bookingsTrend. length} months`);
    console.log('💰 Fetching revenue breakdown...');

    // Revenue breakdown by booking_type
    const revBreakQ = `
      SELECT booking_type, COALESCE(SUM(total_amount),0)::numeric(14,2) AS total
      FROM bookings
      GROUP BY booking_type
      ORDER BY total DESC
    `;
    const revBreakRes = await pool.query(revBreakQ);
    const revenueBreakdown = revBreakRes.rows.map(r => ({
      booking_type: r.booking_type || 'other',
      name: (r.booking_type === 'room' ?  'Accommodations' : 
             (r.booking_type === 'activity' ? 'Activities' : 
             String(r.booking_type || 'Other'))),
      value: parseFloat(r.total)
    }));

    console.log(`✅ Revenue breakdown retrieved: ${revenueBreakdown.length} categories`);
    console.log('📋 Fetching recent bookings.. .');

    // Recent bookings (latest 6)
    const recentQ = `
      SELECT b.booking_id, b.user_id, b.contact_name, b.contact_email, 
             b.booking_type, b.reference_id, b.total_amount, b.currency, 
             b.status, b.payment_status, b.start_date, b.end_date, 
             b.quantity, b.guests, b.created_at, u.full_name AS user_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b.user_id
      ORDER BY b.created_at DESC
      LIMIT 6
    `;
    const recentRes = await pool.query(recentQ);
    const recentBookings = recentRes.rows.map(r => ({
      booking_id:  r.booking_id,
      user_id: r.user_id,
      user_name: r.user_name || r.contact_name || null,
      contact_email: r.contact_email || null,
      booking_type: r.booking_type,
      reference_id: r. reference_id,
      total_amount: parseFloat(r.total_amount || 0),
      currency: r.currency || 'USD',
      status:  r.status,
      payment_status: r.payment_status,
      start_date: r. start_date ?  r.start_date.toISOString().slice(0,10) : null,
      end_date: r.end_date ? r.end_date.toISOString().slice(0,10) : null,
      quantity: r.quantity,
      guests: r.guests,
      created_at: r. created_at
    }));

    console.log(`✅ Recent bookings retrieved: ${recentBookings.length} bookings`);
    console.log('🎉 All data processed successfully');
    console.log('='.repeat(60) + '\n');

    const response = {
      success: true,
      totals,
      bookingsTrend,
      revenueBreakdown,
      recentBookings
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Admin stats error: ');
    console.error('Error name:', err.name);
    console.error('Error message:', err. message);
    console.error('Error stack:', err.stack);
    console.error('='.repeat(60) + '\n');
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load admin stats',
      error: process.env.NODE_ENV === 'development' ? err.message :  undefined
    });
  }
};

module.exports = {
  getAdminStats
};