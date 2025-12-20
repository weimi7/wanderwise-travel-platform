const express = require('express');
const router = express.Router();

// Controllers
const {
  getAllDestinations,
  getDestinationBySlug,
  createDestination,
  getNearbyDestinations,
} = require('../controllers/destinationController');

const { getActivitiesByDestination } = require('../controllers/activityController');

// Destination Routes

// GET all destinations
router.get('/', getAllDestinations);

// Create a new destination
router.post('/', createDestination);

// GET destination by slug (specific route must come before dynamic :id)
router.get('/slug/:slug', getDestinationBySlug);

// GET nearby destinations by destination ID
router.get('/:id/nearby', getNearbyDestinations);

// GET activities by destination ID
router.get('/:id/activities', getActivitiesByDestination);

module.exports = router;
