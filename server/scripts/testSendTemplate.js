'use strict';

/**
 * Test script: send a password-reset email using the SendGrid dynamic template.
 *
 * Usage:
 * 1. Create a file named ".env" in your backend root (if you don't already have one) with the following:
 *
 *    SENDGRID_API_KEY=SG.xxxxx
 *    SENDGRID_FROM_EMAIL="WanderWise <no-reply@yourdomain.com>"
 *    SUPPORT_EMAIL=support@yourdomain.com
 *    SENDGRID_TEMPLATE_RESET_ID=d-e356f7ac78fe42db93c168d7ec6b28d3
 *    TEST_RESET_RECIPIENT=you@example.com
 *
 * 2. Run:
 *    node scripts/testSendTemplate.js
 *
 * The script will send a single test email to TEST_RESET_RECIPIENT.
 */

require('dotenv').config();
const util = require('util');

const { sendEmail } = require('../services/emailService');

async function run() {
  const templateId = process.env.SENDGRID_TEMPLATE_RESET_ID;
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL;
  const replyTo = process.env.SUPPORT_EMAIL || from;
  const to = process.env.TEST_RESET_RECIPIENT || '';

  if (!apiKey) {
    console.error('ERROR: SENDGRID_API_KEY is not set in environment. Aborting.');
    process.exit(1);
  }
  if (!from) {
    console.error('ERROR: SENDGRID_FROM_EMAIL is not set in environment. Aborting.');
    process.exit(1);
  }
  if (!to) {
    console.error('ERROR: TEST_RESET_RECIPIENT is not set in environment. Set TEST_RESET_RECIPIENT=you@example.com in .env');
    process.exit(1);
  }

  // Build a realistic reset_url for the test (change host if needed)
  const resetUrl = `https://localhost:3000/auth/reset-password?token=TEST-TOKEN-123&email=${encodeURIComponent(to)}`;

  // Provide dynamic_template_data matching your SendGrid template variables.
  const dynamicTemplateData = {
    user_name: 'Test User',
    reset_url: resetUrl,
    expires_minutes: 60,
    support_email: process.env.SUPPORT_EMAIL || from,
  };

  try {
    if (templateId) {
      console.log('Sending using SendGrid dynamic template:', templateId);
      await sendEmail({
        to,
        templateId,
        dynamicTemplateData,
        from,
        replyTo
      });
      console.log('✅ Template send request completed. Check recipient inbox and SendGrid Email Activity.');
    } else {
      console.log('SENDGRID_TEMPLATE_RESET_ID not set — falling back to inline HTML/text send.');
      const subject = 'WanderWise — Reset your password (test)';
      const html = `
        <p>Hi Test User,</p>
        <p>This is a test reset link (expires in 60 minutes):</p>
        <p><a href="${resetUrl}">Reset password</a></p>
        <p>If you didn't request this, ignore this message.</p>
      `;
      const text = `Reset link: ${resetUrl}`;
      await sendEmail({ to, subject, html, text, from, replyTo });
      console.log('✅ Inline test email sent.');
    }
  } catch (err) {
    console.error('❌ Send failed.');
    // If SendGrid returned detailed response body, print it for debugging
    if (err && err.response && err.response.body) {
      console.error('SendGrid response body:', util.inspect(err.response.body, { depth: 4 }));
    } else {
      console.error(err);
    }
    process.exit(2);
  }
}

run();