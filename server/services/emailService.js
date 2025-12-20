'use strict';
const sgMail = require('@sendgrid/mail');

// Load API key from environment
if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set - emails will fail until configured.');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * sendEmail - reusable function to send emails
 * Supports:
 *  - Raw HTML/text send: pass { to, subject, html, text, from, replyTo }
 *  - Dynamic template send: pass { to, templateId, dynamicTemplateData, from, replyTo }
 *
 * @param {Object} options
 * @param {string} options.to - recipient email
 * @param {string} [options.subject] - email subject (required for non-template sends)
 * @param {string} [options.html] - email content in HTML
 * @param {string} [options.text] - plain-text fallback
 * @param {string} [options.templateId] - SendGrid dynamic template id (optional)
 * @param {Object} [options.dynamicTemplateData] - dynamic data for template (optional)
 * @param {string} [options.from] - optional override from address (defaults to ENV)
 * @param {string} [options.replyTo] - optional Reply-To header
 * @returns {Promise<Object>} - SendGrid response (or throws on failure)
 */
const sendEmail = async ({ to, subject, html, text, templateId, dynamicTemplateData, from, replyTo }) => {
  // If templateId provided, build message for dynamic template send
  const msg = templateId
    ? {
        to,
        from: from || process.env.SENDGRID_FROM_EMAIL,
        templateId,
        dynamic_template_data: dynamicTemplateData,
        replyTo: replyTo || undefined,
      }
    : {
        to,
        from: from || process.env.SENDGRID_FROM_EMAIL,
        subject,
        html,
        text: text || undefined,
        replyTo: replyTo || undefined,
      };

  try {
    const res = await sgMail.send(msg);
    console.log('📧 Email sent successfully to:', to, templateId ? `(template ${templateId})` : '');
    return res;
  } catch (error) {
    // Log the error detail and re-throw so callers (controllers) can handle / log to DB
    console.error('❌ SendGrid Email Error:', error?.response?.body || error.message || error);
    throw error;
  }
};

module.exports = { sendEmail };