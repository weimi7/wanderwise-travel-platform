// ========================
// Validation Middleware (Toast-Friendly Version)
// ========================
const { body, validationResult } = require('express-validator');

// Signup validation rules
const signupValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Full name is required'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .isIn(['admin', 'traveler', 'business'])
    .withMessage('Role must be admin, traveler, or business'),

  // Traveler fields
  body('country')
    .if(body('role').equals('traveler'))
    .notEmpty()
    .withMessage('Country is required for travelers'),

  body('phone')
    .if(body('role').equals('traveler'))
    .notEmpty()
    .withMessage('Phone number is required for travelers')
    .isLength({ min: 5 })
    .withMessage('Phone number must be at least 5 characters'),

  body('countryCode')
    .if(body('role').equals('traveler'))
    .optional()
    .matches(/^\+\d{1,4}$/)
    .withMessage('Country code must start with + and contain 1-4 digits'),

  // Business fields
  body('businessName')
    .if(body('role').equals('business'))
    .notEmpty()
    .withMessage('Business name is required for business accounts'),

  body('businessType')
    .if(body('role').equals('business'))
    .isIn(['Hotel/Accommodation', 'Tour/Activity Provider'])
    .withMessage('Business type must be Hotel/Accommodation or Tour/Activity Provider'),

  body('businessAddress')
    .if(body('role').equals('business'))
    .notEmpty()
    .withMessage('Business address is required for business accounts'),
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Profile update validation rules
const profileUpdateValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),

  body('phone')
    .optional()
    .isLength({ min: 5 })
    .withMessage('Phone number must be at least 5 characters'),

  body('countryCode')
    .optional()
    .matches(/^\+\d{1,4}$/)
    .withMessage('Country code must start with + and contain 1-4 digits'),

  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country name is too long'),
];

// Enhanced error handling
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = {
  signupValidation,
  loginValidation,
  profileUpdateValidation,
  handleValidationErrors,
};
