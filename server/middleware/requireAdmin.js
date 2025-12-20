/**
 * Cleaner Admin Middleware
 * - Uses Authorization: Bearer <token>
 * - Verifies JWT using your main auth system
 * - Confirms user exists and has admin role
 */

const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Force proper secret usage
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET is missing in .env!");
}
const JWT_SECRET = process.env.JWT_SECRET;

/** Helper */
const extractToken = (req) => {
  const header = req.headers.authorization;
  if (!header) return null;
  if (!header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

module.exports = async function requireAdmin(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

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

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const r = await pool.query(
      "SELECT id, full_name, email, role, is_active FROM users WHERE id = $1",
      [userId]
    );

    if (!r.rows.length) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    const user = r.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: `Account is inactive.`,
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.user = user; // unified user object
    next();
  } catch (err) {
    console.error("requireAdmin error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error in admin authentication",
    });
  }
};
