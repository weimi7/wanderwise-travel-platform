const express = require("express");
const router = express.Router();
const axios = require("axios");

const AI_SERVICE_URL = "http://localhost:8001"; // FastAPI service

// -----------------------------
//  AI Travel Chatbot Route
// -----------------------------
router.post("/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;

    const payload = {
      message,
      history: history || [],
      context: context || "travel-sri-lanka",
    };

    const response = await axios.post(`${AI_SERVICE_URL}/chat`, payload);

    return res.json({
      reply: response.data.reply,
    });

  } catch (error) {
    console.error("Chatbot AI Error:", error?.response?.data || error.message);

    return res.status(500).json({
      error: "Chatbot service failed",
      details: error?.response?.data || error.message,
    });
  }
});

module.exports = router;
