// server/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Support multiple env var naming conventions (fallbacks)
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME || process.env.CLOUDINARY_URL && (() => {
  // if CLOUDINARY_URL present, try to parse it: cloudinary://<key>:<secret>@<cloud_name>
  try {
    const url = process.env.CLOUDINARY_URL;
    const m = url.match(/@(.+)$/);
    return m ? m[1] : undefined;
  } catch (e) {
    return undefined;
  }
})();

const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY || undefined;
const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET || undefined;

cloudinary.config({
  cloud_name: cloudName || '',
  api_key: apiKey || '',
  api_secret: apiSecret || '',
  secure: true,
});

// Non-sensitive log for debugging — shows which cloud name the server is using
console.log('[cloudinary] configured cloud_name=', !!cloudName ? cloudName : '(none)');

module.exports = cloudinary;