const express = require("express");
const router = express.Router();
const { 
  sendTestEmail, 
  resendBookingConfirmation 
} = require("../controllers/emailController");

// Middleware
const { authenticateToken } = require("../middleware/auth");
const { authLimiter } = require("../middleware/rateLimiting");

/* ===================================================
   PUBLIC ROUTES (with rate limiting)
=================================================== */

// POST /api/email/test
// Body:  { to: "recipient@example. com" }
// Description: Send a test email to verify email service configuration
router.post("/test", authLimiter, sendTestEmail);

/* ===================================================
   PROTECTED ROUTES (require authentication)
=================================================== */

// POST /api/email/resend-booking
// Body: { bookingId: "booking_id_here" }
// Description:  Resend booking confirmation email to customer
// Auth:  Requires valid JWT token
router.post("/resend-booking", authenticateToken, authLimiter, resendBookingConfirmation);

module.exports = router;