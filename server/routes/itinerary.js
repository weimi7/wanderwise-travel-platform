const express = require("express");
const router = express.Router();
const axios = require("axios");

const AI_SERVICE_URL = "http://localhost:8001"; // FastAPI

router.post("/generate", async (req, res) => {
  try {
    const { destinations, days, preferences } = req.body;

    // Payload for FastAPI (matches your simple ItineraryRequest model)
    const payload = {
      destinations,
      days,
      preferences,
    };

    const response = await axios.post(`${AI_SERVICE_URL}/itinerary`, payload);

    return res.json(response.data);

  } catch (error) {
    console.error("AI-Service Error:", error?.response?.data || error.message);

    return res.status(500).json({
      error: "AI service failed",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
