'use strict';
const express = require('express');
const router = express.Router();
const planner = require('../controllers/plannerController');

// Public share viewer
router.get('/share/:token', planner.getSharedPreset);

module.exports = router;