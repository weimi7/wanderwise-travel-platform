'use strict';
const pool = require('../config/db');

// List bookings with filters (status, payment_status, booking_type, q) and pagination
const listBookings = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('📦 Admin Bookings List Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?. id || 'Unknown');
  console.log('🔐 Role:', req.user?.role || 'Unknown');
  console.log('📝 Query params:', req.query);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    const { 
      status, 
      payment_status, 
      booking_type, 
      q, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const clauses = [];
    const params = [];

    if (status) { 
      params.push(status); 
      clauses.push(`b.status = $${params. length}`); 
    }
    
    if (payment_status) { 
      params.push(payment_status); 
      clauses.push(`b.payment_status = $${params.length}`); 
    }
    
    if (booking_type) { 
      params.push(booking_type); 
      clauses.push(`b.booking_type = $${params.length}`); 
    }
    
    if (q && q.trim() !== '') { 
      params.push(`%${q.trim()}%`); 
      clauses.push(`(b.contact_name ILIKE $${params.length} OR b.contact_email ILIKE $${params.length} OR b.contact_phone ILIKE $${params.length})`); 
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    console.log('🔍 WHERE clause:', whereClause);
    console.log('📊 Query params:', params);

    const countRes = await pool.query(`SELECT COUNT(*) FROM bookings b ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count, 10);

    console.log(`📈 Total records: ${total}`);

    const dataQ = `
      SELECT b.*, u.full_name AS actor_name
      FROM bookings b
      LEFT JOIN users u ON u.id = b. user_id
      ${whereClause}
      ORDER BY b. created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, parseInt(limit, 10), offset];
    const { rows } = await pool.query(dataQ, dataParams);

    console.log(`✅ Retrieved ${rows.length} bookings`);
    console.log('='.repeat(60) + '\n');

    res.status(200).json({ 
      success: true, 
      bookings: rows, 
      pagination: { 
        total, 
        page: parseInt(page, 10), 
        limit: parseInt(limit, 10), 
        totalPages:  Math.ceil(total / parseInt(limit, 10)) 
      } 
    });
  } catch (err) {
    console.error('❌ listBookings admin error: ');
    console.error('Error name:', err.name);
    console.error('Error message:', err. message);
    console.error('Error stack:', err.stack);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to list bookings',
      error: process.env.NODE_ENV === 'development' ? err.message :  undefined
    });
  }
};

// Update booking status and optionally payment status (admin)
const updateBookingStatus = async (req, res) => {
  console.log('\n' + '='.repeat(60));
  console.log('✏️ Admin Update Booking Status Request');
  console.log('='.repeat(60));
  console.log('👤 User:', req.user?. id || 'Unknown');
  console.log('🆔 Booking ID:', req.params.id);
  console.log('📝 Body:', req.body);

  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updates = [];
    const params = [];
    let idx = 1;
    
    if (status) { 
      updates.push(`status = $${idx++}`); 
      params.push(status); 
    }
    
    if (payment_status) { 
      updates.push(`payment_status = $${idx++}`); 
      params.push(payment_status); 
    }

    if (updates.length === 0) {
      console.log('❌ No updates provided');
      console.log('='.repeat(60) + '\n');
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }

    const q = `UPDATE bookings SET ${updates.join(', ')} WHERE booking_id = $${idx} RETURNING *`;
    params.push(id);

    console.log('📝 Update query:', q);
    console.log('📊 Update params:', params);

    const { rows } = await pool. query(q, params);
    
    if (rows.length === 0) {
      console.log('❌ Booking not found');
      console.log('='.repeat(60) + '\n');
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log('✅ Booking updated successfully');
    console.log('='.repeat(60) + '\n');

    res.status(200).json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error('❌ updateBookingStatus error:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('='.repeat(60) + '\n');

    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  listBookings,
  updateBookingStatus
};