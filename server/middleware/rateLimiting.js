// ========================
// Rate Limiting Middleware (Toast-Friendly)
// ========================
const rateLimit = require('express-rate-limit');

// General auth limiter (for login, token refresh)
const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 2 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Signup specific limiter (more restrictive)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10000,
  message: {
    success: false,
    message: 'Too many signup attempts. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Profile update limiter
const profileUpdateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  message: {
    success: false,
    message: 'Too many profile update attempts. Please try again in 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  signupLimiter,
  passwordResetLimiter,
  profileUpdateLimiter,
  generalLimiter,
};
