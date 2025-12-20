'use strict';
const pool = require('../config/db');

// Basic validators
const cardNumberValid = (num) => {
  // Accept 1234-5678-1234-5678 or 1234567812345678
  if (!num) return false;
  const n = num.replace(/[\s-]/g, '');
  return /^\d{13,19}$/.test(n);
};
const cardExpiryValid = (mmYY) => {
  if (!mmYY) return false;
  if (!/^\d{2}\/\d{2}$/.test(mmYY)) return false;
  const [mm, yy] = mmYY.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const year = 2000 + yy;
  const exp = new Date(year, mm);
  return exp > now;
};
const cvcValid = (cvc) => /^\d{3,4}$/.test(cvc);

// POST /api/bookings
// Body: { booking_type:'room'|'activity', reference_id, start_date, end_date, quantity, guests, contact_name, contact_email, contact_phone, total_amount, currency, payment_method, payment (object for card) }
const createBooking = async (req, res) => {
  try {
    const user = req.user; // requireAuth ensures this exists
    const data = req.body;

    // Basic required validations
    const { booking_type, reference_id, total_amount, payment_method } = data;
    if (!booking_type || !['room', 'activity'].includes(booking_type)) {
      return res.status(400).json({ success: false, message: 'Invalid booking_type' });
    }
    if (!reference_id) {
      return res.status(400).json({ success: false, message: 'reference_id required' });
    }
    if (!total_amount || Number(total_amount) <= 0) {
      return res.status(400).json({ success: false, message: 'total_amount invalid' });
    }
    if (!payment_method) {
      return res.status(400).json({ success: false, message: 'payment_method required' });
    }

    // If card payment, validate card payload
    let payment_status = 'pending';
    let payment_details = null;
    if (payment_method === 'card') {
      const payment = data.payment || {};
      const { card_type, card_number, expiry, cvc, card_holder } = payment;
      // Validate presence
      if (!card_type || !card_number || !expiry || !cvc || !card_holder) {
        return res.status(400).json({ success: false, message: 'Incomplete card details' });
      }
      // Validate formats
      if (!/^(Visa|Master|Amex|Discover|JCB|Diners)$/i.test(card_type)) {
        // accept common names; case-insensitive
        return res.status(400).json({ success: false, message: 'Unsupported card type' });
      }
      if (!cardNumberValid(card_number)) {
        return res.status(400).json({ success: false, message: 'Invalid card number format' });
      }
      if (!cardExpiryValid(expiry)) {
        return res.status(400).json({ success: false, message: 'Invalid expiry (MM/YY)' });
      }
      if (!cvcValid(cvc)) {
        return res.status(400).json({ success: false, message: 'Invalid CVC' });
      }

      // Simulate instant payment success for card
      payment_status = 'paid';
      // Mask card number for storage
      const masked = card_number.replace(/\d(?=\d{4})/g, '*');
      payment_details = {
        card_type,
        card_holder,
        card_number_masked: masked,
        gateway: 'simulated',
        transaction_id: `sim-${Date.now()}`,
        raw: { note: 'Simulated card capture' }
      };
    } else {
      // For other methods, create a pending payment record (could be external workflow)
      payment_status = 'pending';
      payment_details = { gateway: payment_method, raw: null };
    }

    // Determine booking status based on payment
    const status = payment_status === 'paid' ? 'confirmed' : 'pending';

    // Insert booking
    // NOTE: placeholders must match the number of values provided below.
    const insertQuery = `
      INSERT INTO bookings 
        (user_id, booking_type, reference_id, start_date, end_date, quantity, guests,
         contact_name, contact_email, contact_phone, total_amount, currency, payment_method,
         payment_status, status, payment_details, meta)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      RETURNING *
    `;

    // Use values in same order as placeholders above
    const values = [
      user.id,
      booking_type,
      reference_id,
      data.start_date || null,
      data.end_date || null,
      data.quantity || 1,
      data.guests || 1,
      data.contact_name || (user.full_name || null),
      data.contact_email || (user.email || null),
      data.contact_phone || null,
      Number(total_amount),
      data.currency || 'USD',
      payment_method,
      payment_status,
      status,
      payment_details ? JSON.stringify(payment_details) : null,
      data.meta ? JSON.stringify(data.meta) : null
    ];

    const { rows } = await pool.query(insertQuery, values);
    const booking = rows[0];

    res.status(201).json({
      success: true,
      booking: booking,
      message: payment_status === 'paid' ? 'Booking confirmed and paid' : 'Booking created (payment pending)'
    });
  } catch (err) {
    console.error('❌ createBooking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

// GET /api/bookings (list user's bookings)
const getUserBookings = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const q = `
      SELECT * FROM bookings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const { rows } = await pool.query(q, [user.id, limit, offset]);

    res.status(200).json({ success: true, bookings: rows });
  } catch (err) {
    console.error('❌ getUserBookings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM bookings WHERE booking_id = $1 LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = rows[0];

    // Allow admin or owner
    if (user.role !== 'admin' && booking.user_id !== user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error('❌ getBookingById error:', err);
    res.status(500).json({ success: false, message: 'Failed to get booking' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
};