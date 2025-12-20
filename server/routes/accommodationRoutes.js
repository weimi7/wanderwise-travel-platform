const express = require('express');
const router = express.Router();

// Controllers
const {
  getAllAccommodations,
  getAccommodationBySlug,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getAccommodationRoomTypes,
  getAccommodationAmenities,
  getAccommodationImages,
  getAccommodationCategories
} = require('../controllers/accommodationController');

// Accommodation Routes

// Public
router.get('/', getAllAccommodations);
router.get('/slug/:slug', getAccommodationBySlug);
router.get('/:id/room-types', getAccommodationRoomTypes);
router.get('/:id/amenities', getAccommodationAmenities);
router.get('/:id/images', getAccommodationImages);
router.get('/categories', getAccommodationCategories);

// Admin only
router.post('/', createAccommodation);
router.put('/:id', updateAccommodation);
router.delete('/:id', deleteAccommodation);


module.exports = router;