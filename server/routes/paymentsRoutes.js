const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");
const requireAuth = require("../middleware/requireAuth"); // use if you want only authenticated users to create intents

// POST /api/payments/create-payment-intent
// Protected route recommended: only logged-in users should create payment intents.
router.post("/create-payment-intent", requireAuth, paymentsController.createPaymentIntent);

module.exports = router;