const express = require('express');
const router = express.Router();
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  searchJobs
} = require('../controllers/careersController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes
router.get('/jobs', getAllJobs);
router.get('/jobs/search', searchJobs);
router.get('/jobs/:id', getJobById);

// Admin routes
router.post('/jobs', authenticateToken, requireAdmin, createJob);
router.put('/jobs/:id', authenticateToken, requireAdmin, updateJob);
router.delete('/jobs/:id', authenticateToken, requireAdmin, deleteJob);

module.exports = router;