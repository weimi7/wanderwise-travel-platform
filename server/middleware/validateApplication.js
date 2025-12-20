'use strict';

/**
 * Validate application submission data
 */
function validateApplicationData(req, res, next) {
  const {
    jobId,
    jobTitle,
    fullName,
    email,
    phone,
    location,
    currentRole,
    experience,
    coverLetter
  } = req.body;

  const errors = [];

  // Required fields
  if (!jobId) errors.push('Job ID is required');
  if (!jobTitle) errors.push('Job title is required');
  if (!fullName || fullName.trim().length < 2) errors.push('Valid full name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!phone || phone. trim().length < 10) errors.push('Valid phone number is required');
  if (!location || location.trim().length < 2) errors.push('Location is required');
  if (!currentRole || currentRole.trim().length < 2) errors.push('Current role is required');
  if (!experience) errors.push('Experience is required');
  if (!coverLetter || coverLetter.trim().length < 100) errors.push('Cover letter must be at least 100 characters');

  // File validation
  if (!req.file) {
    errors.push('Resume file is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
}

module.exports = {
  validateApplicationData
};