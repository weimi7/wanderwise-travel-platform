'use strict';
const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById } = require('../controllers/bookingController');
const requireAuth = require('../middleware/requireAuth');

// Create booking (authenticated users)
router.post('/', requireAuth, createBooking);

// List user's bookings
router.get('/', requireAuth, getUserBookings);

// Get single booking (owner or admin)
router.get('/:id', requireAuth, getBookingById);

module.exports = router;