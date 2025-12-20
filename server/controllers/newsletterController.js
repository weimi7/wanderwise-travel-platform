"use strict";
const pool = require("../config/db");
const { sendEmail } = require('../services/emailService');

/* -------------------------------------------------
   EMAIL VALIDATION
---------------------------------------------------*/
function validateEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim().toLowerCase());
}

/* -------------------------------------------------
   SUBSCRIBE TO NEWSLETTER
---------------------------------------------------*/
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res. status(400).json({
        success: false,
        message:  'Please provide a valid email address.',
      });
    }

    const emailLower = email. trim().toLowerCase();
    const clientIP = req.ip || req. connection.remoteAddress || req. headers['x-forwarded-for'];
    const userAgent = req.get('user-agent') || null;

    // Check if email already exists
    const existingSubscriber = await pool.query(
      'SELECT id, status FROM newsletter_subscribers WHERE email = $1',
      [emailLower]
    );

    if (existingSubscriber.rows. length > 0) {
      const subscriber = existingSubscriber. rows[0];

      // If already active
      if (subscriber. status === 'active') {
        return res.status(200).json({
          success: true,
          message: 'You are already subscribed to our newsletter! ',
          alreadySubscribed: true,
        });
      }

      // If previously unsubscribed, reactivate
      if (subscriber.status === 'unsubscribed') {
        await pool.query(
          'UPDATE newsletter_subscribers SET status = $1, subscribed_at = NOW(), unsubscribed_at = NULL WHERE email = $2',
          ['active', emailLower]
        );

        // Send reactivation email
        await sendNewsletterWelcomeEmail(emailLower, true);

        return res.status(200).json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
    }

    // Insert new subscriber
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, status, subscribed_at, source, ip_address, user_agent)
       VALUES ($1, $2, NOW(), $3, $4, $5)`,
      [emailLower, 'active', 'footer', clientIP, userAgent]
    );

    // Send welcome email
    await sendNewsletterWelcomeEmail(emailLower, false);

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed!  Check your email for a welcome message.',
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    // Handle duplicate email constraint
    if (error.code === '23505') {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        alreadySubscribed: true,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.',
    });
  }
};

/* -------------------------------------------------
   SEND NEWSLETTER WELCOME EMAIL
---------------------------------------------------*/
async function sendNewsletterWelcomeEmail(email, isReactivation = false) {
  const templateId = process.env.SENDGRID_TEMPLATE_NEWSLETTER_ID;
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const unsubscribeUrl = `${frontendUrl}/newsletter/unsubscribe? email=${encodeURIComponent(email)}`;

  try {
    if (templateId) {
      // ============================================
      // PRIMARY:  Use SendGrid Dynamic Template
      // ============================================
      console.log(`Sending newsletter welcome email using SendGrid template:  ${templateId}`);
      
      await sendEmail({
        to: email,
        templateId: templateId,
        dynamicTemplateData: {
          subscriber_email: email,
          is_reactivation: isReactivation,
          unsubscribe_url: unsubscribeUrl,
          current_year: new Date().getFullYear(),
          frontend_url: frontendUrl,
          support_email: process.env. SENDGRID_FROM_EMAIL || 'support@wanderwise.com'
        }
      });

      console.log(`✅ Newsletter welcome email sent to ${email} using SendGrid template`);
    } else {
      // ============================================
      // FALLBACK: Simple HTML Email
      // ============================================
      console.log('SendGrid newsletter template ID not configured.  Using simple fallback email.');
      
      const subject = isReactivation 
        ? 'Welcome Back to WanderWise Newsletter!' 
        : 'Welcome to WanderWise Newsletter!';
      
      const html = `
<! DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding:  20px;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #667eea; margin:  0;">🌴 WanderWise</h1>
    </div>
    
    <h2>${isReactivation ? 'Welcome Back!' : 'Welcome to Our Newsletter!'}</h2>
    
    <p>Hi there,</p>
    
    <p>${isReactivation 
      ? 'We\'re excited to have you back!  Your subscription has been reactivated.' 
      : 'Thank you for subscribing to the WanderWise newsletter! We\'re thrilled to have you join our community of adventure seekers.'
    }</p>
    
    <p><strong>What you'll receive:</strong></p>
    <ul>
      <li>Exclusive travel tips for Sri Lanka</li>
      <li>Hidden gems and local recommendations</li>
      <li>Special offers and discounts</li>
      <li>Stunning destination highlights</li>
      <li>Seasonal travel guides</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${frontendUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Explore WanderWise
      </a>
    </div>
    
    <p>Get ready to discover the magic of Sri Lanka with us!</p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      You're receiving this email because you subscribed to WanderWise newsletter. <br>
      You can <a href="${unsubscribeUrl}" style="color: #667eea;">unsubscribe</a> at any time. <br><br>
      
      WanderWise<br>
      Colombo, Sri Lanka<br>
      © ${new Date().getFullYear()} All rights reserved
    </p>
    
  </div>
</body>
</html>
      `;

      const text = `
${isReactivation ? 'Welcome Back to WanderWise Newsletter!' :  'Welcome to WanderWise Newsletter!'}

Hi there,

${isReactivation 
  ? 'We\'re excited to have you back! Your subscription has been reactivated.' 
  : 'Thank you for subscribing to the WanderWise newsletter! We\'re thrilled to have you join our community of adventure seekers.'
}

What you'll receive: 
- Exclusive travel tips for Sri Lanka
- Hidden gems and local recommendations
- Special offers and discounts
- Stunning destination highlights
- Seasonal travel guides

Visit us:  ${frontendUrl}

Get ready to discover the magic of Sri Lanka with us!

---
You can unsubscribe at any time:  ${unsubscribeUrl}

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

      console.log(`✅ Newsletter welcome email sent to ${email} using simple fallback template`);
    }
  } catch (emailError) {
    console.error('❌ Failed to send newsletter welcome email:', emailError);
    // Don't throw error - subscription should still succeed
  }
}

/* -------------------------------------------------
   UNSUBSCRIBE FROM NEWSLETTER
---------------------------------------------------*/
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res. status(400).json({
        success: false,
        message:  'Please provide a valid email address.',
      });
    }

    const emailLower = email. trim().toLowerCase();

    const result = await pool.query(
      'UPDATE newsletter_subscribers SET status = $1, unsubscribed_at = NOW() WHERE email = $2 AND status = $3 RETURNING id',
      ['unsubscribed', emailLower, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our subscriber list.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter.',
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe. Please try again later.',
    });
  }
};

/* -------------------------------------------------
   GET SUBSCRIBER COUNT (ADMIN)
---------------------------------------------------*/
exports.getStats = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed,
        COUNT(*) as total
      FROM newsletter_subscribers
    `);

    return res.status(200).json({
      success: true,
      stats: stats.rows[0],
    });

  } catch (error) {
    console.error('Newsletter stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve stats.',
    });
  }
};

/* -------------------------------------------------
   GET ALL SUBSCRIBERS (ADMIN)
---------------------------------------------------*/
exports.getAllSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT email, status, subscribed_at, unsubscribed_at, source 
       FROM newsletter_subscribers 
       WHERE status = $1 
       ORDER BY subscribed_at DESC 
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM newsletter_subscribers WHERE status = $1',
      [status]
    );

    return res.status(200).json({
      success: true,
      subscribers: result.rows,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscribers.',
    });
  }
};