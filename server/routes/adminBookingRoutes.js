'use strict';

const express = require('express');
const router = express.Router();
const { 
  listBookings, 
  updateBookingStatus 
} = require('../controllers/adminBookingController');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// Log when this route file is loaded
console.log('📦 Loading adminBookingRoutes.. .');

/**
 * @route   POST /api/admin/bookings/: id/status
 * @desc    Update booking status (MUST be before /:id route if you have one)
 * @access  Private (Admin only)
 */
router.post('/:id/status', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin booking status update route hit');
  console.log('Method:', req.method);
  console.log('Booking ID:', req.params.id);
  console.log('Body:', req.body);
  next();
}, updateBookingStatus);

/**
 * @route   GET /api/admin/bookings
 * @desc    List all bookings with filters
 * @access  Private (Admin only)
 * Query params:  status, payment_status, booking_type, q, page, limit
 */
router.get('/', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin bookings list route hit');
  console.log('Method:', req.method);
  console.log('Query params:', req.query);
  next();
}, listBookings);

console.log('✅ adminBookingRoutes loaded successfully');

module.exports = router;