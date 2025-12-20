'use strict';
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const requireAuth = require('../middleware/requireAuth');

/**
 * Generic review endpoints (query-style)
 *
 * GET    /api/reviews?reviewable_type=destination&reviewable_id=3   -> public
 * POST   /api/reviews                      -> create review (auth)  (kept for backwards compat)
 * GET    /api/reviews/mine                 -> current user's reviews (auth)
 * PUT    /api/reviews/:id                  -> update a review (auth)
 *
 * Additional endpoints added:
 * POST   /api/reviews/:id/vote             -> vote on a review (auth)
 * GET    /api/reviews/:id/votes            -> get vote summary + voters (owner/admin sees voters)
 * GET    /api/reviews/:id/replies          -> list replies for a review (public)
 * POST   /api/reviews/:id/replies          -> post a reply (auth)
 */

// Public search-style endpoint
router.get('/', reviewController.getPublicReviews);

// Create a review (requires auth) - keep for flexibility (also nested routes exist)
router.post('/', requireAuth, reviewController.addReview);

// Get current user's reviews (requires auth)
router.get('/mine', requireAuth, reviewController.getUserReviews);

// Update a review (owner or admin) - requires auth
router.put('/:id', requireAuth, reviewController.updateReview);

// Vote endpoints
router.post('/:id/vote', requireAuth, reviewController.voteReview);
router.get('/:id/votes', reviewController.getReviewVotes);

// Replies endpoints
router.get('/:id/replies', reviewController.getReplies);
router.post('/:id/replies', requireAuth, reviewController.postReply);

module.exports = router;