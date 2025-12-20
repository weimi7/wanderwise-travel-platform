const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiting');

// Public routes
router.post('/subscribe', authLimiter, newsletterController.subscribe);
router.post('/unsubscribe', authLimiter, newsletterController.unsubscribe);

// Admin routes (protected)
router.get('/stats', authenticateToken, newsletterController. getStats);
router.get('/subscribers', authenticateToken, newsletterController.getAllSubscribers);

module.exports = router;