'use strict';

/**
 * Validate file type for resume/CV
 */
function isValidResumeType(mimetype) {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  return allowedTypes.includes(mimetype);
}

/**
 * Validate file size (in bytes)
 */
function isValidFileSize(size, maxSizeMB = 8) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

module.exports = {
  isValidResumeType,
  isValidFileSize,
  getFileExtension,
  sanitizeFilename
};