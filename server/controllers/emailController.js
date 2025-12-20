'use strict';

const { sendEmail } = require('../services/emailService');
const pool = require("../config/db");
const bookingConfirmationTemplate = require('../emails/bookingConfirmationEmail');

/**
 * sendResetEmail - helper used by authController to send password reset emails and log the attempt. 
 * Enhanced with modern, beautiful styling. 
 *
 * @param {Object} params
 * @param {string} params.to - recipient email
 * @param {string} params.resetUrl - full reset URL (frontend)
 * @param {string|null} params.userId - user id if available (for logging)
 * @param {string|null} params.userName - user full name (optional)
 * @param {number} [params.expiresMinutes] - minutes until token expiry (used in copy)
 */

async function logEmail({ userId, to, subject, html, provider = 'SendGrid', status = 'sent', error = null }) {
  try {
    const sql = `
      INSERT INTO email_logs 
        (id, user_id, to_address, subject, body_html, provider, status, error_message, created_at) 
      VALUES 
        (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id
    `;
    const vals = [
      userId || null,
      to,
      subject,
      html || null,
      provider,
      status,
      error ? String(error) : null
    ];
    await pool.query(sql, vals);
  } catch (err) {
    // Logging failure should not break main flow
    console.warn('Failed to write email log', err);
  }
}

/**
 * Minimal HTML escape for insertion of user-provided strings into templates
 */
function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

/**
 * sendResetEmail - helper used by authController to send password reset emails and log the attempt.
 * Prefers a SendGrid dynamic template if SENDGRID_TEMPLATE_RESET_ID is configured,
 * otherwise falls back to inline HTML + plain-text.
 *
 * @param {Object} params
 * @param {string} params.to - recipient email
 * @param {string} params.resetUrl - full reset URL (frontend)
 * @param {string|null} params.userId - user id if available (for logging)
 * @param {string|null} params.userName - user full name (optional)
 * @param {number} [params.expiresMinutes] - minutes until token expiry (used in copy)
 */
async function sendResetEmail({ to, resetUrl, userId = null, userName = null, expiresMinutes = 60 }) {
  const templateId = process.env. SENDGRID_TEMPLATE_RESET_ID || null;
  const from = process.env. SENDGRID_FROM_EMAIL;
  const replyTo = process.env.SUPPORT_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  const subject = '🔐 Reset your WanderWise password';
  const safeName = userName ?  escapeHtml(userName) : 'Traveler';

  if (templateId) {
    const dynamicTemplateData = {
      user_name: userName || 'Traveler',
      reset_url: resetUrl,
      expires_minutes: expiresMinutes,
      support_email:  process.env.SUPPORT_EMAIL || ''
    };

    try {
      await sendEmail({
        to,
        templateId,
        dynamicTemplateData,
        from,
        replyTo
      });

      await logEmail({ userId, to, subject:  `${subject} (template)`, html: `[template:${templateId}]`, provider: 'SendGrid', status: 'sent' });
      return { success:  true };
    } catch (err) {
      await logEmail({ userId, to, subject: `${subject} (template)`, html: `[template:${templateId}]`, provider: 'SendGrid', status: 'failed', error: err?.message || String(err) });
      throw err;
    }
  }

  // Enhanced inline HTML template
  const preheader = `Reset your password in just a few clicks. Link expires in ${expiresMinutes} minutes. `;

  const html = `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="color-scheme" content="light dark" />
      <meta name="supported-color-schemes" content="light dark" />
      <title>Reset your password</title>
      <style>
        * { margin: 0; padding:  0; box-sizing: border-box; }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
          background:  linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #1e293b; 
          margin: 0; 
          padding: 20px; 
          line-height: 1.6;
        }
        
        .wrapper {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius:  16px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align:  center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 30px 30px;
          animation: drift 20s linear infinite;
        }
        
        @keyframes drift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, 30px); }
        }
        
        .logo-container {
          position: relative;
          z-index: 1;
          display: inline-flex;
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          margin-bottom: 20px;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .logo-icon {
          font-size: 40px;
        }
        
        .header-title {
          position: relative;
          z-index: 1;
          font-size: 28px;
          margin:  0;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .header-subtitle {
          position: relative;
          z-index: 1;
          color: rgba(255, 255, 255, 0.9);
          font-size: 15px;
          margin-top: 8px;
        }
        
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        
        .greeting {
          font-size: 20px;
          font-weight:  600;
          color: #1e293b;
          margin-bottom: 20px;
        }
        
        .message {
          color: #475569;
          font-size:  15px;
          line-height: 1.7;
          margin-bottom: 16px;
        }
        
        .info-box {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-left: 4px solid #f59e0b;
          padding: 16px 20px;
          border-radius:  8px;
          margin:  24px 0;
        }
        
        .info-box-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .info-icon {
          font-size: 24px;
        }
        
        .info-text {
          color: #92400e;
          font-size: 14px;
          font-weight: 500;
        }
        
        .button-container {
          text-align: center;
          margin:  32px 0;
        }
        
        .reset-button {
          display: inline-block;
          padding: 16px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration:  none;
          font-weight: 600;
          font-size: 16px;
          border-radius: 12px;
          box-shadow:  0 10px 30px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }
        
        .reset-button:hover {
          transform:  translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }
        
        .divider {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 32px 0;
        }
        
        .alternative-text {
          color: #94a3b8;
          font-size: 13px;
          margin-bottom: 12px;
        }
        
        .url-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          word-break: break-all;
          font-size: 12px;
          color: #475569;
          font-family: monospace;
        }
        
        .url-link {
          color: #667eea;
          text-decoration: none;
        }
        
        .security-notice {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-radius: 12px;
          padding: 20px;
          margin-top: 32px;
        }
        
        .security-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom:  12px;
        }
        
        .security-icon {
          font-size: 24px;
        }
        
        .security-title {
          font-size: 16px;
          font-weight:  600;
          color: #1e40af;
          margin: 0;
        }
        
        .security-text {
          color: #1e40af;
          font-size:  14px;
          line-height: 1.6;
        }
        
        .footer {
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 18px;
          font-weight:  700;
          color: #1e293b;
          margin-bottom: 16px;
        }
        
        .footer-brand-icon {
          font-size:  24px;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .footer-link {
          color: #667eea;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
        }
        
        .footer-text {
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }
        
        .footer-contact {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }
        
        .social-links {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top:  20px;
        }
        
        .social-link {
          display: inline-flex;
          width: 40px;
          height: 40px;
          background: #ffffff;
          border-radius: 10px;
          align-items:  center;
          justify-content:  center;
          text-decoration: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .social-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
          body { padding: 10px; }
          . header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .header-title { font-size: 24px; }
          .reset-button { padding: 14px 32px; font-size: 15px; }
          .footer-links { flex-direction: column; gap: 12px; }
        }
      </style>
    </head>
    <body>
      <!-- Preheader text -->
      <div style="display: none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#ffffff; opacity:0;">
        ${preheader}
      </div>
      
      <div class="wrapper" role="article" aria-roledescription="email" aria-label="Password reset email from WanderWise">
        <!-- Header -->
        <div class="header">
          <div class="logo-container">
            <span class="logo-icon">🌴</span>
          </div>
          <h1 class="header-title">Password Reset Request</h1>
          <p class="header-subtitle">Secure your WanderWise account</p>
        </div>

        <!-- Content -->
        <div class="content">
          <p class="greeting">Hi ${safeName}!  👋</p>
          
          <p class="message">
            We received a request to reset the password for your WanderWise account.  No worries—it happens to the best of us! 
          </p>
          
          <p class="message">
            Click the button below to create a new password.  This link is valid for the next <strong>${expiresMinutes} minutes</strong>.
          </p>

          <!-- Info Box -->
          <div class="info-box">
            <div class="info-box-content">
              <span class="info-icon">⏰</span>
              <span class="info-text">This reset link expires in ${expiresMinutes} minutes for your security.</span>
            </div>
          </div>

          <!-- Reset Button -->
          <div class="button-container">
            <a href="${resetUrl}" class="reset-button" target="_blank" rel="noopener">
              🔐 Reset My Password
            </a>
          </div>

          <hr class="divider" />

          <!-- Alternative Link -->
          <p class="alternative-text">
            If the button above doesn't work, copy and paste this link into your browser: 
          </p>
          <div class="url-box">
            <a href="${resetUrl}" class="url-link" target="_blank" rel="noopener">${resetUrl}</a>
          </div>

          <!-- Security Notice -->
          <div class="security-notice">
            <div class="security-header">
              <span class="security-icon">🛡️</span>
              <h3 class="security-title">Security Notice</h3>
            </div>
            <p class="security-text">
              If you didn't request this password reset, please ignore this email or contact our support team immediately.  Your account remains secure.
            </p>
          </div>

          <p class="message" style="margin-top: 32px;">
            Safe travels,<br/>
            <strong>The WanderWise Team</strong> 🌍
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div class="footer-brand">
            <span class="footer-brand-icon">🌴</span>
            <span>WanderWise</span>
          </div>
          
          <div class="footer-links">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/about" class="footer-link">About Us</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" class="footer-link">Contact</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/legal/privacy-policy" class="footer-link">Privacy</a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/legal/terms-of-service" class="footer-link">Terms</a>
          </div>

          <!-- Social Links -->
          <div class="social-links">
            <a href="https://facebook.com" class="social-link" aria-label="Facebook" target="_blank" rel="noopener">
              📘
            </a>
            <a href="https://instagram.com" class="social-link" aria-label="Instagram" target="_blank" rel="noopener">
              📷
            </a>
            <a href="https://twitter.com" class="social-link" aria-label="Twitter" target="_blank" rel="noopener">
              🐦
            </a>
          </div>

          <p class="footer-text" style="margin-top: 20px;">
            Need help? Contact us at<br/>
            <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.SENDGRID_FROM_EMAIL}" class="footer-contact">
              ${process.env.SUPPORT_EMAIL || process.env.SENDGRID_FROM_EMAIL}
            </a>
          </p>

          <p class="footer-text" style="margin-top: 12px;">
            📍 WanderWise • Colombo, Sri Lanka<br/>
            © ${new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </div>
    </body>
  </html>
  `;

  // Enhanced plain text version
  const text = `
🌴 WANDERWISE - PASSWORD RESET REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi ${userName || 'Traveler'}! 👋

We received a request to reset the password for your WanderWise account. 

🔐 RESET YOUR PASSWORD
Click the link below to create a new password: 
${resetUrl}

⏰ IMPORTANT:  This link expires in ${expiresMinutes} minutes for your security.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛡️ SECURITY NOTICE
If you didn't request this password reset, please ignore this email or contact our support team immediately. Your account remains secure.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Safe travels,
The WanderWise Team 🌍

Need help? Contact us: 
📧 ${process.env. SUPPORT_EMAIL || process.env. SENDGRID_FROM_EMAIL}
📍 Colombo, Sri Lanka

© ${new Date().getFullYear()} WanderWise.  All rights reserved.
`;

  try {
    await sendEmail({
      to,
      subject,
      html,
      text,
      from,
      replyTo
    });

    await logEmail({ userId, to, subject, html, provider: 'SendGrid', status: 'sent' });
    return { success: true };
  } catch (err) {
    await logEmail({ userId, to, subject, html, provider: 'SendGrid', status: 'failed', error: err?. message || String(err) });
    throw err;
  }
}

/**
 * POST /api/email/test
 * Sends a test email
 */
async function sendTestEmail(req, res) {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ success: false, message: 'Missing "to" address' });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Test Email from WanderWise</h2>
        <p>If you received this email, your email service is working properly.</p>
      </div>
    `;

    try {
      await sendEmail({ to, subject: 'WanderWise Test Email', html: htmlContent, text: 'Test Email from WanderWise' });
      await logEmail({ userId: null, to, subject: 'WanderWise Test Email', html: htmlContent, status: 'sent' });
    } catch (sendErr) {
      await logEmail({ userId: null, to, subject: 'WanderWise Test Email', html: htmlContent, status: 'failed', error: sendErr?.message || String(sendErr) });
      console.error('sendTestEmail send error:', sendErr);
      return res.status(500).json({ success: false, message: 'Failed to send test email' });
    }

    return res.json({ success: true, message: 'Test email sent' });
  } catch (err) {
    console.error('sendTestEmail error', err);
    return res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
}

/**
 * POST /api/email/resend-booking
 * Resends a booking confirmation email
 */
async function resendBookingConfirmation(req, res) {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ success: false, message: 'Missing bookingId' });

    // fetch booking and user
    const bq = await pool.query(`
      SELECT b.*, u.id as user_id, u.email, u.full_name 
      FROM bookings b 
      JOIN users u ON u.id = b.user_id 
      WHERE b.booking_id = $1 
      LIMIT 1
    `, [bookingId]);

    if (!bq.rows.length) return res.status(404).json({ success: false, message: 'Booking not found' });

    const row = bq.rows[0];
    const user = { id: row.user_id, email: row.email, full_name: row.full_name };
    const booking = row;

    const htmlContent = bookingConfirmationTemplate({
      name: user.full_name || 'Traveler',
      destination: booking.reference_id,
      date: booking.start_date
        ? `${booking.start_date} to ${booking.end_date || booking.start_date}`
        : 'N/A',
      amount: booking.total_amount,
    });

    try {
      await sendEmail({
        to: user.email,
        subject: `Booking Confirmation — ${booking.booking_id}`,
        html: htmlContent,
        text: `Booking Confirmation — ${booking.booking_id}`
      });

      await logEmail({
        userId: user.id,
        to: user.email,
        subject: `Booking Confirmation — ${booking.booking_id}`,
        html: htmlContent,
        status: 'sent'
      });
    } catch (sendErr) {
      await logEmail({
        userId: user.id,
        to: user.email,
        subject: `Booking Confirmation — ${booking.booking_id}`,
        html: htmlContent,
        status: 'failed',
        error: sendErr?.message || String(sendErr)
      });
      console.error('resendBookingConfirmation send error:', sendErr);
      return res.status(500).json({ success: false, message: 'Failed to resend booking confirmation' });
    }

    return res.json({ success: true, message: 'Booking confirmation email resent' });
  } catch (err) {
    console.error('resendBookingConfirmation error', err);
    return res.status(500).json({ success: false, message: 'Failed to resend booking confirmation' });
  }
}

module.exports = {
  sendTestEmail,
  resendBookingConfirmation,
  // exported helpers for use by other controllers (authController)
  logEmail,
  sendResetEmail
};