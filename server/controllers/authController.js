"use strict";
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const path = require("path");
const streamifier = require("streamifier");
const axios = require("axios"); // Add this for Turnstile verification

// Use centralized Cloudinary config
const cloudinary = require('../config/cloudinary');

// Email service for sending password reset emails
const { sendEmail } = require('../services/emailService');
const { sendWelcomeEmail } = require('../helpers/emailHelpers');

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const JWT_EXPIRES_IN = process. env.JWT_EXPIRES_IN || "7d";

// Token TTL (minutes)
const TOKEN_TTL_MINUTES = Number(process.env.TOKEN_TTL_MINUTES || 60);

/* -------------------------------------------------
   CLOUDFLARE TURNSTILE VERIFICATION
---------------------------------------------------*/
async function verifyTurnstile(token, remoteIP) {
  try {
    const secretKey = process.env. CLOUDFLARE_TURNSTILE_SECRET_KEY;
    
    if (!secretKey) {
      console.warn('Turnstile secret key not configured');
      return true; // Skip verification in development if not configured
    }

    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        secret: secretKey,
        response: token,
        remoteip: remoteIP,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return response.data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error. message);
    return false;
  }
}

/* -------------------------------------------------
   PHONE HELPERS — CLEAN + MATCH CLIENT EXACTLY
---------------------------------------------------*/
function normalizePhone(value) {
  if (!value) return null;
  const raw = String(value).trim();

  // Already correct international format
  if (/^\+[1-9]\d{7,14}$/.test(raw)) return raw;

  // Remove non-digits
  const digits = raw.replace(/\D/g, "");

  // Sri Lanka local number starting with 0 — convert to +94
  if (/^0\d{9}$/.test(digits)) return "+94" + digits. slice(1);

  // SL 94XXXXXXXXX
  if (/^94\d{7,14}$/.test(digits)) return "+" + digits;

  // Fallback for general E.164 compatible numbers
  if (/^\d{7,15}$/.test(digits)) return "+" + digits;

  return null;
}

function isValidE164(value) {
  return !!value && /^\+[1-9]\d{7,14}$/.test(value);
}

/* -------------------------------------------------
   EMAIL HELPERS
---------------------------------------------------*/
function normalizeEmail(email) {
  if (!email) return null;
  return String(email).trim().toLowerCase();
}

function validateEmailFormat(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim());
}

/* -------------------------------------------------
   INPUT VALIDATION
---------------------------------------------------*/
const validateInput = (role, data) => {
  if (!data. fullName || !data.email || ! data.password)
    return "Missing required fields:  fullName, email, and password are required. ";

  if (! validateEmailFormat(data.email))
    return "Invalid email format. ";

  if (data.password.length < 6)
    return "Password must be at least 6 characters long. ";
  if (!/\d/.test(data.password))
    return "Password must contain at least one number.";
  if (!/[! @#$%^&*]/.test(data.password))
    return "Password must contain at least one special character (! @#$%^&*).";

  if (role === "traveler") {
    if (!data.country || !data.phone)
      return "Missing required traveler fields: country and phone are required.";
  } else if (role === "business") {
    if (!data.businessName || !data.businessType || !data.businessAddress)
      return "Missing required business fields: businessName, businessType, and businessAddress are required.";
    const allowed = ["Hotel/Accommodation", "Tour/Activity Provider"];
    if (!allowed.includes(data.businessType))
      return 'Invalid business type. Must be "Hotel/Accommodation" or "Tour/Activity Provider".';
  } else if (role !== "admin") {
    return 'Invalid role selected. Must be "traveler", "business", or "admin".';
  }

  return null;
};

/* -------------------------------------------------
   Helper to stream-upload buffer to Cloudinary
---------------------------------------------------*/
async function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/* -------------------------------------------------
   SIGNUP
---------------------------------------------------*/
exports.signup = async (req, res) => {
  try {
    const {
      role,
      fullName,
      email,
      password,
      country,
      phone,
      businessName,
      businessType,
      businessAddress,
      licenseNo,
      turnstileToken,
    } = req.body;

    // Verify Turnstile token
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const isVerified = await verifyTurnstile(turnstileToken, clientIP);

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verification failed. Please complete the captcha challenge.",
      });
    }

    const validationError = validateInput(role, req.body);
    if (validationError)
      return res.status(400).json({ success: false, message: validationError });

    const emailNormalized = normalizeEmail(email);

    const emailCheck = await pool.query(
      "SELECT id FROM users WHERE lower(email) = lower($1)",
      [emailNormalized]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please use another email.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    let formattedPhone = null;
    if (role === "traveler") {
      const normalized = normalizePhone(phone);
      if (! normalized || ! isValidE164(normalized)) {
        return res.status(400).json({
          success: false,
          message: "Invalid phone number format.  Use +947XXXXXXXX or 0XXXXXXXXX.",
        });
      }
      formattedPhone = normalized;
    }

    const insertValues = [
      userId,
      fullName,
      emailNormalized,
      passwordHash,
      formattedPhone,
      country || null,
      businessName || null,
      businessType || null,
      businessAddress || null,
      licenseNo || null,
      role,
    ];

    const result = await pool.query(
      `
      INSERT INTO users (
        id, full_name, email, password_hash, phone, country,
        business_name, business_type, business_address, license_number,
        role, is_active, created_at, updated_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11, TRUE, NOW(), NOW()
      )
      RETURNING id, full_name, email, role, phone, country, avatar_url,
        business_name, business_type, business_address, license_number, created_at
      `,
      insertValues
    );

    const newUser = result.rows[0];

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // 🎉 Send welcome email (non-blocking)
    sendWelcomeEmail(emailNormalized, fullName, role, false).catch(err => {
      console.error('Welcome email failed but signup succeeded:', err);
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully! ",
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    if (err.code === "23505") return res.status(409).json({ success: false, message: "Email already exists." });
    return res.status(500).json({ success: false, message: "Failed to create account." });
  }
};

/* -------------------------------------------------
   LOGIN
---------------------------------------------------*/
exports.login = async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required." });

    // Verify Turnstile token
    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const isVerified = await verifyTurnstile(turnstileToken, clientIP);

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verification failed. Please complete the captcha challenge.",
      });
    }

    const emailLookup = normalizeEmail(email);

    const userResult = await pool.query(
      `
      SELECT id, full_name, email, password_hash, role, phone, country, avatar_url,
             business_name, business_type, business_address, license_number,
             is_active, created_at
      FROM users
      WHERE lower(email) = lower($1) AND is_active = TRUE
      `,
      [emailLookup]
    );

    if (! userResult.rows.length)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    delete user.password_hash;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({ success: true, message: "Login successful!", user, token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Login failed." });
  }
};

/* -------------------------------------------------
   VERIFY TOKEN
---------------------------------------------------*/
exports.verifyToken = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res.status(401).json({ success: false, message: "No token provided." });

    const decoded = jwt.verify(token, JWT_SECRET);

    const userResult = await pool. query(
      "SELECT id, full_name, email, role, avatar_url FROM users WHERE id = $1 AND is_active = TRUE",
      [decoded.id]
    );

    if (!userResult. rows.length)
      return res.status(401).json({ success: false, message: "Invalid token or user not found." });

    return res.json({ success: true, user: userResult.rows[0] });
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
};

/* -------------------------------------------------
   REFRESH TOKEN
---------------------------------------------------*/
exports. refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool. query(
      "SELECT id, full_name, email, role, avatar_url FROM users WHERE id = $1 AND is_active = TRUE",
      [userId]
    );
    if (!userResult.rows.length) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    const user = userResult.rows[0];
    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      token: newToken,
      user,
    });
  } catch (err) {
    console.error("Token refresh error:", err);
    return res.status(500).json({ success: false, message: "Failed to refresh token." });
  }
};

/* -------------------------------------------------
   LOGOUT
---------------------------------------------------*/
exports.logout = (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message:  "Logout failed." });
  }
};

/* -------------------------------------------------
   GET CURRENT USER
---------------------------------------------------*/
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userResult = await pool.query(
      `SELECT id, full_name, email, role, phone, country, avatar_url,
              business_name, business_type, business_address, license_number,
              created_at, updated_at
       FROM users WHERE id = $1 AND is_active = TRUE`,
      [userId]
    );
    if (!userResult.rows. length) {
      return res. status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user: userResult.rows[0] });
  } catch (err) {
    console.error("Get current user error:", err);
    return res.status(500).json({ success: false, message: "Failed to get user information." });
  }
};

/* -------------------------------------------------
   UPDATE PROFILE
---------------------------------------------------*/
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?. id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const {
      full_name,
      email,
      phone,
      country,
      currentPassword,
      newPassword,
      avatar_url,
    } = req.body;

    if ((currentPassword || newPassword) && !(currentPassword && newPassword)) {
      return res.status(400).json({ success: false, message: "Both currentPassword and newPassword are required to change password" });
    }

    if (newPassword && typeof newPassword === "string") {
      if (newPassword. length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      }
    }

    if (email && ! validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message:  "Invalid email format" });
    }

    if (email) {
      const { rows: existing } = await pool.query("SELECT id FROM users WHERE lower(email) = lower($1) AND id != $2", [email. trim(), userId]);
      if (existing.length > 0) {
        return res.status(409).json({ success: false, message:  "Email already in use" });
      }
    }

    if (currentPassword && newPassword) {
      const { rows: userRows } = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
      if (! userRows || userRows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

      const storedHash = userRows[0]. password_hash;
      const match = await bcrypt.compare(currentPassword, storedHash);
      if (!match) return res.status(401).json({ success: false, message: "Current password is incorrect" });

      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newPassword, salt);
      await pool.query("UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3", [newHash, new Date(), userId]);
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (full_name !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(String(full_name).trim());
    }
    if (email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(String(email).trim().toLowerCase());
    }
    if (phone !== undefined) {
      if (phone === null || (typeof phone === "string" && phone.trim() === "")) {
        fields.push(`phone = $${idx++}`);
        values.push(null);
      } else {
        const normalized = normalizePhone(phone);
        if (!normalized || !isValidE164(normalized)) {
          return res.status(400).json({ success: false, message:  "Invalid phone format.  Provide international format." });
        }
        fields. push(`phone = $${idx++}`);
        values.push(normalized);
      }
    }
    if (country !== undefined) {
      fields.push(`country = $${idx++}`);
      values.push(country);
    }
    if (avatar_url !== undefined) {
      fields.push(`avatar_url = $${idx++}`);
      values.push(avatar_url);
    }

    if (fields.length > 0) {
      fields.push(`updated_at = $${idx++}`);
      values.push(new Date());
      values.push(userId);
      const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, full_name, email, role, country, phone, avatar_url, created_at, updated_at`;
      const { rows } = await pool.query(sql, values);

      if (rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

      return res.json({ success: true, user: rows[0] });
    }

    const { rows: finalRows } = await pool.query("SELECT id, full_name, email, role, country, phone, avatar_url, created_at, updated_at FROM users WHERE id = $1", [userId]);
    if (! finalRows || finalRows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user: finalRows[0] });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------------
   UPLOAD AVATAR
---------------------------------------------------*/
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req. user?.id;
    if (! userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const userRow = await pool.query("SELECT avatar_public_id FROM users WHERE id = $1 LIMIT 1", [userId]);
    const oldPublicId = userRow.rows[0]?.avatar_public_id || null;

    const folder = process.env.CLOUDINARY_AVATAR_FOLDER || "wanderwise/avatars";
    const uploadOptions = {
      folder,
      resource_type: "image",
      transformation: [{ width: 400, height: 400, crop:  "fill", gravity: "face" }],
      fetch_format: "auto",
      quality: "auto",
    };

    const result = await uploadBufferToCloudinary(req. file.buffer, uploadOptions);

    if (! result || !result.secure_url) {
      console.error("Cloudinary returned unexpected result:", result);
      return res.status(500).json({ success: false, message: "Failed to upload avatar" });
    }

    const avatarUrl = result.secure_url;
    const publicId = result.public_id;

    await pool.query(
      "UPDATE users SET avatar_url = $1, avatar_public_id = $2, updated_at = NOW() WHERE id = $3",
      [avatarUrl, publicId, userId]
    );

    if (oldPublicId) {
      cloudinary.uploader.destroy(oldPublicId).catch((e) => {
        console.warn("Failed to delete old avatar on Cloudinary:", e?. message || e);
      });
    }

    return res.json({ success: true, avatar_url: avatarUrl, public_id: publicId });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    const clientMsg = err?.message || "Avatar upload failed";
    return res. status(500).json({ success: false, message: clientMsg });
  }
};

/* -------------------------------------------------
   FORGOT PASSWORD
---------------------------------------------------*/
exports.postForgotPassword = async (req, res) => {
  try {
    const emailRaw = req.body?. email;
    if (!emailRaw) {
      return res.json({ success: true, message: 'If an account exists, we sent password reset instructions.' });
    }

    const email = normalizeEmail(emailRaw);
    if (!validateEmailFormat(email)) {
      return res.json({ success: true, message: 'If an account exists, we sent password reset instructions.' });
    }

    const { rows } = await pool.query('SELECT id, full_name FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
    if (! rows.length) {
      return res.json({ success: true, message: 'If an account exists, we sent password reset instructions.' });
    }

    const user = rows[0];

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    // Save token to database
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used, request_ip, request_user_agent, created_at)
       VALUES ($1,$2,$3,false,$4,$5,NOW())`,
      [user.id, tokenHash, expiresAt, req.ip || null, req.get('user-agent') || null]
    );

    // Build reset URL
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/auth/reset-password? token=${encodeURIComponent(rawToken)}&email=${encodeURIComponent(email)}`;

    const safeName = user.full_name || 'Traveler';
    const templateId = process.env.SENDGRID_TEMPLATE_RESET_ID;

    try {
      if (templateId) {
        // ============================================
        // PRIMARY:  Use SendGrid Dynamic Template
        // ============================================
        console.log(`Attempting to send password reset using SendGrid template: ${templateId}`);
        
        await sendEmail({
          to: email,
          templateId:  templateId,
          dynamicTemplateData: {
            user_name: safeName,
            reset_url: resetUrl,
            expires_minutes: TOKEN_TTL_MINUTES,
            support_email: process.env. SENDGRID_FROM_EMAIL || 'support@wanderwise. com',
            current_year: new Date().getFullYear(),
            frontend_url: frontendUrl
          }
        });

        console.log(`✅ Password reset email sent to ${email} using SendGrid template ${templateId}`);
      } else {
        // ============================================
        // FALLBACK: Simple Plain Email
        // ============================================
        console.log('SendGrid template ID not configured. Using simple fallback email.');
        
        const subject = 'Reset your WanderWise password';
        
        const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <h2>Reset Your Password</h2>
    
    <p>Hi ${safeName},</p>
    
    <p>We received a request to reset the password for your WanderWise account.</p>
    
    <p>Click the link below to reset your password:</p>
    
    <p>
      <a href="${resetUrl}" style="color: #0066cc;">${resetUrl}</a>
    </p>
    
    <p><strong>This link will expire in ${TOKEN_TTL_MINUTES} minutes.</strong></p>
    
    <p>If you didn't request this password reset, please ignore this email. </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      WanderWise<br>
      Colombo, Sri Lanka<br>
      © ${new Date().getFullYear()} All rights reserved
    </p>
    
  </div>
</body>
</html>
        `;

        // Plain text version
        const text = `
Reset Your Password

Hi ${safeName},

We received a request to reset the password for your WanderWise account.

Click this link to reset your password:
${resetUrl}

This link will expire in ${TOKEN_TTL_MINUTES} minutes. 

If you didn't request this password reset, please ignore this email. 

---
WanderWise
Colombo, Sri Lanka
© ${new Date().getFullYear()} All rights reserved
        `;

        await sendEmail({
          to: email,
          subject,
          html,
          text
        });

        console.log(`✅ Password reset email sent to ${email} using simple fallback template`);
      }

    } catch (emailErr) {
      console.error('❌ Failed to send reset email:', emailErr);
      // Don't expose email errors to client for security
    }

    return res.json({ success: true, message: 'If an account exists, we sent password reset instructions.' });
  } catch (err) {
    console.error('postForgotPassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to request password reset' });
  }
};

/* -------------------------------------------------
   RESET PASSWORD
---------------------------------------------------*/
exports.postResetPassword = async (req, res) => {
  try {
    const { token, email:  emailRaw, password } = req.body || {};

    if (!token || !emailRaw || !password) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    const email = normalizeEmail(emailRaw);
    if (!validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const userQ = await pool.query('SELECT id, password_hash FROM users WHERE lower(email) = lower($1) LIMIT 1', [email]);
    if (!userQ.rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid token or email' });
    }
    const user = userQ.rows[0];

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

    const tokenRowQ = await pool.query(
      `SELECT id, used, expires_at FROM password_reset_tokens WHERE user_id = $1 AND token_hash = $2 LIMIT 1`,
      [user.id, tokenHash]
    );

    if (! tokenRowQ.rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid token or email' });
    }

    const tokenRow = tokenRowQ.rows[0];

    if (tokenRow.used) {
      return res.status(400).json({ success: false, message: 'Token already used' });
    }
    if (new Date(tokenRow.expires_at) < new Date()) {
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    const saltRounds = 12;
    const newHash = await bcrypt.hash(password, saltRounds);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, user.id]);

    await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [tokenRow. id]);

    await pool.query('UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND id != $2', [user.id, tokenRow.id]);

    return res.json({ success: true, message: 'Password updated successfully.  Please sign in with your new password.' });
  } catch (err) {
    console.error('postResetPassword error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};