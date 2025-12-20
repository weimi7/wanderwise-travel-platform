'use strict';
const express = require('express');
const router = express.Router();
const planner = require('../controllers/plannerController');
const requireAuth = require('../middleware/requireAuth');

// Presets (require auth)
router.post('/presets', requireAuth, planner.createPreset);
router.get('/presets', requireAuth, planner.listPresets);
router.get('/presets/:id', requireAuth, planner.getPreset);
router.delete('/presets/:id', requireAuth, planner.deletePreset);

// Share creation (owner only)
router.post('/presets/:id/share', requireAuth, planner.createShare);

// PDF generation (protected)
if (typeof planner.generatePdf === 'function') {
  router.post('/:id/pdf', requireAuth, planner.generatePdf);
} else if (typeof planner.generatePdfStub === 'function') {
  router.post('/:id/pdf', requireAuth, planner.generatePdfStub);
} else {
  router.post('/:id/pdf', requireAuth, (req, res) => {
    res.status(501).json({ success: false, message: 'PDF generation not implemented on the server.' });
  });
}

// Public: generate PDF from raw itinerary content
// POST /api/planner/pdf-from-content
router.post('/pdf-from-content', planner.generatePdfFromContent);

module.exports = router;