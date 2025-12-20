"use strict";

/**
 * requireAuth Middleware
 * ----------------------
 * - Verifies JWT: Authorization: Bearer <token>
 * - Ensures user exists in DB and is active
 * - Attaches user to req.user
 */

const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Enforce secure secret usage
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET is missing in .env!");
}
const JWT_SECRET = process.env.JWT_SECRET;

// ----------------------
// Helper: Extract Token
// ----------------------
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header) return null;
  if (!header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

module.exports = async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login.",
      });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired. Please login again."
            : "Invalid token. Please login again.",
      });
    }

    // Extract user ID
    const userId = decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    // Load user
    const r = await pool.query(
      `SELECT id, full_name, email, role, is_active AS status
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (!r.rows.length) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    const user = r.rows[0];

    // Check user status
    if (["inactive", "suspended", "banned"].includes(user.status)) {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}.`,
      });
    }

    // Attach full user object
    req.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    return res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};
