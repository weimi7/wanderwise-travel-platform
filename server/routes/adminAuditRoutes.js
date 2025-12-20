'use strict';

const express = require('express');
const router = express.Router();
const {
  listAuditLogs,
  getAuditLog,
  exportAuditLogs
} = require('../controllers/adminAuditController');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// Log when this route file is loaded
console.log('📋 Loading adminAuditRoutes.. .');

/**
 * @route   GET /api/admin/audit-logs/export
 * @desc    Export audit logs as CSV (MUST be before /:id route)
 * @access  Private (Admin only)
 */
router.get('/export', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin audit logs export route hit');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Query params:', req.query);
  next();
}, exportAuditLogs);

/**
 * @route   GET /api/admin/audit-logs/:id
 * @desc    Get a single audit log by ID
 * @access  Private (Admin only)
 */
router.get('/:id', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin audit log detail route hit');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Audit ID:', req.params.id);
  next();
}, getAuditLog);

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get list of audit logs with filters, pagination, and sorting
 * @access  Private (Admin only)
 */
router.get('/', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin audit logs list route hit');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Full URL:', req.originalUrl);
  console.log('Query params:', req. query);
  next();
}, listAuditLogs);

console.log('✅ adminAuditRoutes loaded successfully');

module.exports = router;