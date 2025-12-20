const express = require("express");
const router = express.Router();
const socialAuthController = require("../controllers/socialAuthController");

// Debug POST /social-login wrapper
// Logs incoming body and headers, then calls real controller.
// Returns controller response (or logs any thrown error).
router.post("/social-login", async (req, res) => {
  try {
    console.log("[socialAuth] /social-login called. headers:", {
      origin: req.headers.origin,
      referer: req.headers.referer,
      "content-type": req.headers["content-type"],
    });
    console.log(
      "[socialAuth] body preview:",
      (() => {
        try {
          // show a short preview to avoid logging huge tokens; show first 12/last 12 chars of id_token
          const body = { ...req.body };
          if (typeof body.id_token === "string") {
            const t = body.id_token;
            body.id_token = t.length > 32 ? `${t.slice(0, 12)}...${t.slice(-12)}` : t;
          }
          return body;
        } catch (e) {
          return { error: "failed to preview body" };
        }
      })()
    );

    // Delegate to controller
    return await socialAuthController.socialLogin(req, res);
  } catch (err) {
    console.error("[socialAuth] handler error:", err);
    // Avoid leaking internal stack to client, but return JSON so client won't get HTML
    return res.status(500).json({ success: false, message: "Server error in social-login" });
  }
});

module.exports = router;