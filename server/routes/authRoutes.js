const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware imports
const { signupValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');
const { authLimiter, signupLimiter } = require('../middleware/rateLimiting');
const { authenticateToken } = require('../middleware/auth');

// Multer memory upload middleware for avatar uploads
// (expects server/middleware/memoryUpload.js to exist)
const upload = require('../middleware/memoryUpload');

// Authentication Routes

// POST /api/auth/signup - User registration
router.post('/signup', 
  signupLimiter,
  signupValidation,
  handleValidationErrors,
  authController.signup
);

// POST /api/auth/login - User login
router.post('/login', 
  authLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

// POST /api/auth/verify-token - Verify JWT token
router.post('/verify-token', 
  authenticateToken,
  authController.verifyToken
);

// POST /api/auth/refresh-token - Refresh JWT token
router.post('/refresh-token', 
  authLimiter,
  authenticateToken,
  authController.refreshToken
);

// POST /api/auth/logout - User logout
router.post('/logout',
  authenticateToken,
  authController.logout
);

// GET /api/auth/me - Get current user info
router.get('/me',
  authenticateToken,
  authController.getCurrentUser
);

// PUT /api/auth/update-profile - Update user profile
router.put('/update-profile',
  authenticateToken,
  authController.updateProfile
);

// POST /api/auth/avatar - Upload avatar image (multipart/form-data)
// Expects field name "avatar". Uses multer memoryUpload middleware and authController.uploadAvatar.
router.post(
  '/avatar',
  authenticateToken,
  upload.single('avatar'),
  authController.uploadAvatar
);

// NEW: Forgot password (public)
router.post('/forgot-password',
  authLimiter, // reuse rate limiter for auth endpoints
  authController.postForgotPassword
);

// NEW: Reset password (public) - accepts token, email, new password
router.post('/reset-password',
  authController.postResetPassword
);

module.exports = router;