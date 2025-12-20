'use strict';
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const requireAuth = require('../middleware/requireAuth');

// Simple logger for debugging route hits
const logHit = (req, res, next) => {
  console.log(`[reviews-nested] ${req.method} ${req.originalUrl}`);
  next();
};

router.use(logHit);

// Destinations
router.get('/destinations/:id/reviews', (req, res) => {
  req.params.type = 'destination';
  return reviewController.getPublicReviews(req, res);
});
router.post('/destinations/:id/reviews', requireAuth, (req, res) => {
  req.params.type = 'destination';
  return reviewController.addReview(req, res);
});

// Activities
router.get('/activities/:id/reviews', (req, res) => {
  req.params.type = 'activity';
  return reviewController.getPublicReviews(req, res);
});
router.post('/activities/:id/reviews', requireAuth, (req, res) => {
  req.params.type = 'activity';
  return reviewController.addReview(req, res);
});

// Accommodations
router.get('/accommodations/:id/reviews', (req, res) => {
  req.params.type = 'accommodation';
  return reviewController.getPublicReviews(req, res);
});
router.post('/accommodations/:id/reviews', requireAuth, (req, res) => {
  req.params.type = 'accommodation';
  return reviewController.addReview(req, res);
});

module.exports = router;