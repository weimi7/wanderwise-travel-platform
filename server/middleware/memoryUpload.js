const multer = require("multer");

// Use memory storage so we can forward the file buffer to Cloudinary
const storage = multer.memoryStorage();

const limits = {
  fileSize: 4 * 1024 * 1024 // 4 MB max
};

const upload = multer({
  storage,
  limits,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const mime = (file.mimetype || "").toLowerCase();
    if (allowed.test(mime)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpeg, png, webp)"));
  },
});

module.exports = upload;