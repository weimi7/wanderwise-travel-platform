'use strict';

const express = require('express');
const router = express.Router();
const { 
  listReviews, 
  publishReview, 
  rejectReview, 
  bulkUpdateReviews 
} = require('../controllers/adminReviewController');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

// Log when this route file is loaded
console.log('📝 Loading adminReviewRoutes.. .');

/**
 * @route   POST /api/admin/reviews/bulk
 * @desc    Bulk update reviews (MUST be before /:reviewId routes)
 * @access  Private (Admin only)
 * Body: { action: 'publish'|'reject', ids: [1,2,3] }
 */
router.post('/bulk', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin reviews bulk action route hit');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  next();
}, bulkUpdateReviews);

/**
 * @route   POST /api/admin/reviews/: reviewId/publish
 * @desc    Publish a single review
 * @access  Private (Admin only)
 */
router.post('/:reviewId/publish', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin review publish route hit');
  console.log('Method:', req.method);
  console.log('Review ID:', req.params.reviewId);
  next();
}, publishReview);

/**
 * @route   POST /api/admin/reviews/:reviewId/reject
 * @desc    Reject a single review
 * @access  Private (Admin only)
 */
router.post('/:reviewId/reject', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin review reject route hit');
  console.log('Method:', req.method);
  console.log('Review ID:', req.params.reviewId);
  next();
}, rejectReview);

/**
 * @route   GET /api/admin/reviews
 * @desc    List all reviews with filters
 * @access  Private (Admin only)
 * Query params: status, reviewable_type, reviewable_id, q, page, limit
 */
router. get('/', requireAuth, requireAdmin, (req, res, next) => {
  console.log('🎯 Admin reviews list route hit');
  console.log('Method:', req.method);
  console.log('Query params:', req.query);
  next();
}, listReviews);

console.log('✅ adminReviewRoutes loaded successfully');

module.exports = router;