'use strict';
const multer = require('multer');
const { isValidResumeType } = require('../utils/fileValidator');

// Configure multer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (isValidResumeType(file. mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type.  Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits:  {
    fileSize: 8 * 1024 * 1024, // 8MB
    files:  1
  },
  fileFilter:  fileFilter
});

// Error handler middleware
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 8MB limit'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files.  Only one file is allowed'
      });
    }
  }
  
  if (err.message === 'Invalid file type.  Only PDF, DOC, and DOCX files are allowed.') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next(err);
};

module.exports = {
  upload,
  handleMulterError
};