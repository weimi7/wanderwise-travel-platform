const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// Avoid using a fallback secret — force developer to set it
if (!process.env.JWT_SECRET) {
  console.warn("⚠️ WARNING: JWT_SECRET is not set. Please configure it in .env");
}

const JWT_SECRET = process.env.JWT_SECRET;

// ---------------------------------------------
// Helper: Extract token
// ---------------------------------------------
const extractToken = (req) => {
  const header = req.headers["authorization"];
  if (!header) return null;
  if (!header.startsWith("Bearer ")) return null;
  return header.split(" ")[1];
};

// ---------------------------------------------
// Basic JWT verify
// ---------------------------------------------
const authenticateToken = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required.",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Session expired. Please login again."
            : "Invalid token. Please login again.",
      });
    }

    req.user = decoded;
    next();
  });
};

// ---------------------------------------------
// JWT check + User DB verification
// ---------------------------------------------
const authenticateTokenWithDB = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login required.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return res.status(403).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, role, status 
       FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    const user = result.rows[0];

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}.`,
      });
    }

    req.user = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please login again.",
    });
  }
};

// ---------------------------------------------
// Role-Based Access
// ---------------------------------------------
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You must be: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

const requireAdmin = requireRole(["admin"]);
const requireTravelerOrAdmin = requireRole(["traveler", "admin"]);
const requireBusinessOrAdmin = requireRole(["business", "admin"]);

// ---------------------------------------------
// Optional Authentication
// ---------------------------------------------
const optionalAuth = (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }

  next();
};

// ---------------------------------------------
// Ownership check
// ---------------------------------------------
const requireOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const ownerId =
    req.params.userId || req.body.userId || req.user.id;

  if (req.user.role === "admin" || req.user.id === ownerId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Access denied. Only owner can perform this action.",
  });
};

// ---------------------------------------------
// NEW — Review Author Check (fixed)
// ---------------------------------------------
const requireReviewAuthorOrAdmin = async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;

    if (!reviewId) {
      return res.status(400).json({
        success: false,
        message: "reviewId parameter is required.",
      });
    }

    const result = await pool.query(
      `SELECT user_id FROM reviews WHERE review_id = $1`,
      [reviewId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const owner = result.rows[0].user_id;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.role === "admin" || req.user.id === owner) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Only author or admin can modify this review.",
    });
  } catch (err) {
    console.error("Review auth error:", err);
    return res.status(500).json({
      success: false,
      message: "Authorization failed.",
    });
  }
};

module.exports = {
  authenticateToken,
  authenticateTokenWithDB,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireTravelerOrAdmin,
  requireBusinessOrAdmin,
  requireOwnership,
  requireReviewAuthorOrAdmin,
};