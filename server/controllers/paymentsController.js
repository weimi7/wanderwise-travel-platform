/**
 * server/controllers/paymentsController.js
 *
 * POST /api/payments/create-payment-intent
 * - Creates a Stripe PaymentIntent and returns clientSecret to the client
 *
 * Expect body:
 * {
 *   amount: 123.45,            // required, in main currency units (e.g. USD)
 *   currency: "usd",           // optional, default "usd"
 *   booking_id: "uuid-...",    // optional, useful for metadata
 *   description: "Booking XYZ" // optional
 * }
 *
 * Uses:
 * - STRIPE_SECRET_KEY in env
 * - requireAuth middleware recommended (checks req.user)
 */

const stripeKey = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (stripeKey) {
  // lazy require so local dev without key doesn't crash server unless used
  stripe = require("stripe")(stripeKey);
}

exports.createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: "Payment provider is not configured." });
    }

    const userId = req.user?.id || null; // if you use requireAuth middleware this will be set
    const { amount, currency = "usd", booking_id, description } = req.body || {};

    if (amount === undefined || amount === null) {
      return res.status(400).json({ success: false, message: "amount is required (in main currency units, e.g. 123.45)" });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be a positive number" });
    }

    // Convert to smallest currency unit (cents)
    const amountInMinor = Math.round(numericAmount * 100);

    // Optional idempotency key to avoid creating duplicate intents on retry (client can pass header)
    const idempotencyKey = req.headers["idempotency-key"] || req.body.idempotencyKey || null;

    const paymentIntentParams = {
      amount: amountInMinor,
      currency: String(currency).toLowerCase(),
      description: description || `Booking payment${booking_id ? `: ${booking_id}` : ""}`,
      metadata: {
        ...(booking_id ? { booking_id: String(booking_id) } : {}),
        ...(userId ? { user_id: String(userId) } : {}),
        platform: "wanderwise",
      },
      // optional: enable automatic_payment_methods true for automatic card auth
      automatic_payment_methods: { enabled: true },
    };

    const opts = {};
    if (idempotencyKey) opts.idempotencyKey = idempotencyKey;

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams, opts);

    return res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("createPaymentIntent error:", err);
    // don't leak internal error structure to client
    return res.status(500).json({ success: false, message: "Failed to create payment intent" });
  }
};