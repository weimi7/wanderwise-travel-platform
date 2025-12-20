const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  submitApplication,
  getApplicationById,
  getAllApplications,
  updateApplicationStatus,
  addApplicationNote,
  scheduleInterview,
  getApplicationTimeline
} = require('../controllers/applicationController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer for file upload (memory storage)
const upload = multer({
  storage:  multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed.'));
    }
  }
});

// Public routes
router.post('/apply', upload.single('resume'), submitApplication);

// Admin/HR routes
router.get('/applications', authenticateToken, requireAdmin, getAllApplications);
router.get('/applications/:id', authenticateToken, requireAdmin, getApplicationById);
router.put('/applications/:id/status', authenticateToken, requireAdmin, updateApplicationStatus);
router.post('/applications/:id/notes', authenticateToken, requireAdmin, addApplicationNote);
router.post('/applications/:id/interview', authenticateToken, requireAdmin, scheduleInterview);
router.get('/applications/:id/timeline', authenticateToken, requireAdmin, getApplicationTimeline);

module.exports = router;