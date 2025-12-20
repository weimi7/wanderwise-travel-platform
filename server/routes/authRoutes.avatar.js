// in your existing routes/authRoutes.js near other auth routes:
const upload = require("../middleware/memoryUpload"); // path -> memoryUpload.js
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// New route for avatar upload
router.post("/avatar", authenticateToken, upload.single("avatar"), authController.uploadAvatar);