const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminUsersController");
const requireAdmin = require("../middleware/requireAdmin");

// All routes require admin
router.use(requireAdmin);

// GET /api/admin/users?search=&page=&perPage=&role=
router.get("/", adminController.listUsers);

// GET /api/admin/users/:id
router.get("/:id", adminController.getUser);

// PUT /api/admin/users/:id
router.put("/:id", adminController.updateUser);

// NEW: POST /api/admin/users/:id/update-email
// Body: { email: "new.email@example.com" }
// Admin-only endpoint to safely change a user's email
router.post("/:id/update-email", adminController.updateUserEmail);

// DELETE /api/admin/users/:id
router.delete("/:id", adminController.deleteUser);

module.exports = router;