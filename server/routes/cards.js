'use strict';
/**
 * Express router exposing saved cards endpoints.
 *
 * Mount this file under /api/users/cards in your Express app.
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/cardsController');

// all routes require authentication
router.use(authenticateToken);

router.get('/', controller.listCards);
router.post('/', controller.createCard);
router.delete('/:id', controller.deleteCard);
router.post('/:id/default', controller.setDefault);

module.exports = router;