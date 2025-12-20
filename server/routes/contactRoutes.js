const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiting');

/* ===================================================
   PUBLIC ROUTES (with rate limiting)
=================================================== */

/**
 * POST /api/contact
 * Submit contact form
 * Body: { name, email, subject, message }
 */
router. post('/', authLimiter, contactController.submitContactForm);

/* ===================================================
   ADMIN ROUTES (require authentication)
=================================================== */

/**
 * GET /api/contact/submissions
 * Get all contact submissions (admin only)
 * Query:  ? page=1&limit=20&status=new
 */
router. get(
  '/submissions',
  authenticateToken,
  // Add admin check middleware here if you have one
  contactController.getContactSubmissions
);

/**
 * PATCH /api/contact/submissions/:id
 * Update contact submission status (admin only)
 * Body: { status:  'new' | 'in-progress' | 'resolved' | 'archived' }
 */
router. patch(
  '/submissions/:id',
  authenticateToken,
  // Add admin check middleware here if you have one
  contactController.updateContactStatus
);

module.exports = router;