"use strict";
const { sendEmail } = require('../services/emailService');

/**
 * Send welcome email to new users
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @param {string} role - User role (traveler, business, admin)
 * @param {boolean} isSocialAuth - Whether user signed up via social auth
 */
async function sendWelcomeEmail(email, fullName, role = 'traveler', isSocialAuth = false) {
  const templateId = process.env. SENDGRID_TEMPLATE_WELCOME_ID;
  const frontendUrl = (process.env. FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const safeName = fullName || 'Traveler';

  try {
    if (templateId) {
      // ============================================
      // PRIMARY:  Use SendGrid Dynamic Template
      // ============================================
      console.log(`Sending welcome email using SendGrid template:  ${templateId}`);
      
      await sendEmail({
        to: email,
        templateId:  templateId,
        dynamicTemplateData: {
          user_name: safeName,
          user_role: role,
          is_social_auth: isSocialAuth,
          login_url: `${frontendUrl}/auth/login`,
          dashboard_url: `${frontendUrl}/dashboard/${role}/${safeName. toLowerCase().replace(/\s+/g, '-')}`,
          explore_url: `${frontendUrl}/destinations`,
          support_email: process.env.SENDGRID_FROM_EMAIL || 'support@wanderwise.com',
          current_year: new Date().getFullYear(),
          frontend_url: frontendUrl
        }
      });

      console.log(`✅ Welcome email sent to ${email} using SendGrid template`);
    } else {
      // ============================================
      // FALLBACK: Simple HTML Email
      // ============================================
      console.log('SendGrid welcome template ID not configured.  Using simple fallback email.');
      
      const subject = `Welcome to WanderWise${isSocialAuth ? ' - Let\'s Get Started!' : ''}`;
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding:  20px;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #667eea; margin:  0;">🌴 WanderWise</h1>
    </div>
    
    <h2>Welcome to WanderWise, ${safeName}!</h2>
    
    <p>Hi ${safeName},</p>
    
    <p>${isSocialAuth 
      ? 'Thank you for signing up with your social account! We\'re excited to have you join our community of adventure seekers.' 
      : 'Thank you for creating your WanderWise account! We\'re thrilled to have you join our community of adventure seekers.'
    }</p>
    
    <p><strong>What's next?</strong></p>
    <ul>
      <li>🏝️ Explore stunning destinations in Sri Lanka</li>
      <li>🗓️ Plan your perfect itinerary with AI assistance</li>
      <li>🏨 Book accommodations and activities</li>
      <li>📸 Share your travel experiences</li>
      <li>💰 Get exclusive deals and discounts</li>
    </ul>
    
    <div style="text-align: center; margin:  30px 0;">
      <a href="${frontendUrl}/destinations" style="display: inline-block; padding: 12px 30px; background:  #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Start Exploring
      </a>
    </div>
    
    <p>Need help getting started? Our support team is here to assist you. </p>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      WanderWise - Your Sri Lanka Travel Companion<br>
      Colombo, Sri Lanka<br>
      © ${new Date().getFullYear()} All rights reserved<br><br>
      
      Need help? Contact us at <a href="mailto:${process.env.SENDGRID_FROM_EMAIL}" style="color: #667eea;">${process.env.SENDGRID_FROM_EMAIL}</a>
    </p>
    
  </div>
</body>
</html>
      `;

      const text = `
Welcome to WanderWise, ${safeName}!

Hi ${safeName},

${isSocialAuth 
  ?  'Thank you for signing up with your social account! We\'re excited to have you join our community of adventure seekers.' 
  : 'Thank you for creating your WanderWise account! We\'re thrilled to have you join our community of adventure seekers.'
}

What's next?
- Explore stunning destinations in Sri Lanka
- Plan your perfect itinerary with AI assistance
- Book accommodations and activities
- Share your travel experiences
- Get exclusive deals and discounts

Start exploring:  ${frontendUrl}/destinations

Need help getting started? Our support team is here to assist you.

---
WanderWise - Your Sri Lanka Travel Companion
Colombo, Sri Lanka
© ${new Date().getFullYear()} All rights reserved

Need help? Contact us at ${process.env.SENDGRID_FROM_EMAIL}
      `;

      await sendEmail({
        to: email,
        subject,
        html,
        text
      });

      console.log(`✅ Welcome email sent to ${email} using simple fallback template`);
    }
  } catch (emailError) {
    console.error('❌ Failed to send welcome email:', emailError);
    // Don't throw error - signup should still succeed
  }
}

module.exports = {
  sendWelcomeEmail
};