const express = require('express');
const router = express.Router();

const {
  getAllActivities,
  getRandomActivities,
  getActivitiesByDestination,
  createActivity,
  getActivityBySlug,
  updateActivity,
  deleteActivity
} = require('../controllers/activityController');

// Public routes
router.get('/', getAllActivities); // GET all activities with pagination
router.get('/random', getRandomActivities); // GET random activities
router.get('/destination/:id', getActivitiesByDestination); // GET activities by destination ID
router.get('/slug/:slug', getActivityBySlug); // GET single activity by slug (prefix /slug)

// Admin routes
router.post('/', createActivity); // Create new activity
router.put('/:id', updateActivity); // Update activity
router.delete('/:id', deleteActivity); // Delete activity

module.exports = router;
