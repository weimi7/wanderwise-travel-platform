'use strict';
const express = require('express');
const router = express.Router();
const requireAdmin = require('../middleware/requireAdmin');
const {
  exportUsersReport,
  exportBookingsReport,
  exportRevenueReport
} = require('../controllers/adminReportsController');

// All routes protected by requireAdmin
router.get('/reports/users', requireAdmin, exportUsersReport);
router.get('/reports/bookings', requireAdmin, exportBookingsReport);
router.get('/reports/revenue', requireAdmin, exportRevenueReport);

module.exports = router;