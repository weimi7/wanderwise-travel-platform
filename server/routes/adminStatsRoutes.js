'use strict';

const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminStatsController');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// Log when this route file is loaded
console.log('📊 Loading adminStatsRoutes.. .');

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin stats route hit');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  next();
}, getAdminStats);

console.log('✅ adminStatsRoutes loaded successfully');

module.exports = router;