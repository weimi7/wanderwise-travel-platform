'use strict';
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth'); // assumes middleware exists
const { addFavorite, removeFavorite, listFavorites } = require('../controllers/userFavoritesController');

// Protected routes for the logged-in user
router.post('/favorites', requireAuth, addFavorite);
router.get('/favorites', requireAuth, listFavorites);

// remove by favorite_id
router.delete('/favorites/:id', requireAuth, removeFavorite);
// or remove by type+reference: DELETE /api/users/favorites?favorite_type=accommodation&reference_id=12
router.delete('/favorites', requireAuth, removeFavorite);

module.exports = router;