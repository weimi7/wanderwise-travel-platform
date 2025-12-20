// Add to your existing authController.js (or import this function)
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const pool = require("../config/db"); // adjust path if necessary
const path = require("path");

// configure Cloudinary (ensure env vars are loaded in index.js before requiring controller)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "daziy1ben",
  api_key: process.env.CLOUDINARY_API_KEY || "523585229764699",
  api_secret: process.env.CLOUDINARY_API_SECRET || "h-7fLYbEco5BsM9GYX6ugAgpYrQ",
  secure: true,
});

/**
 * POST /api/auth/avatar
 * - expects 'avatar' multipart/form-data file
 * - requires authenticateToken middleware to set req.user
 * - returns { success: true, avatar_url, public_id }
 */
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Optionally: validate file size/type again here

    // Upload stream to Cloudinary - place uploads in a folder, optionally transform (resize, crop to face)
    const folder = process.env.CLOUDINARY_AVATAR_FOLDER || "wanderwise/avatars";
    const uploadOptions = {
      folder,
      resource_type: "image",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" } // crop to face, fallback center
      ],
      format: "auto",
      quality: "auto",
      overwrite: true,
    };

    // Helper to upload buffer
    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload(req.file.buffer);

    // Save secure_url and public_id to DB
    const avatarUrl = result.secure_url;
    const publicId = result.public_id;

    await pool.query("UPDATE users SET avatar_url = $1, avatar_public_id = $2, updated_at = NOW() WHERE id = $3", [
      avatarUrl,
      publicId,
      userId,
    ]);

    // return new avatar url
    return res.json({ success: true, avatar_url: avatarUrl, public_id: publicId });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    return res.status(500).json({ success: false, message: "Avatar upload failed" });
  }
};