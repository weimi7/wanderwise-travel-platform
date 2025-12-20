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
   SUBMIT CONTACT FORM
---------------------------------------------------*/
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (message.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Message must be at least 10 characters long.',
      });
    }

    const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.get('user-agent') || null;

    // Save to database
    const contactId = await pool.query(
      `INSERT INTO contact_submissions (name, email, subject, message, ip_address, user_agent, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id`,
      [name. trim(), email.trim().toLowerCase(), subject.trim(), message.trim(), clientIP, userAgent, 'new']
    );

    const submissionId = contactId.rows[0].id;

    // Send email to support team (non-blocking)
    sendContactEmail({
      name:  name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      submissionId
    }).catch(err => {
      console.error('Support notification email failed but submission succeeded:', err);
    });

    // Send confirmation email to user (non-blocking)
    sendContactConfirmationEmail({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim()
    }).catch(err => {
      console.error('Confirmation email failed but submission succeeded:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for contacting us!  We\'ll get back to you soon.',
      submissionId
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.',
    });
  }
};

/* -------------------------------------------------
   SEND CONTACT EMAIL TO SUPPORT TEAM
---------------------------------------------------*/
async function sendContactEmail({ name, email, subject, message, submissionId }) {
  const templateId = process.env.SENDGRID_TEMPLATE_CONTACT_ID;
  const recipientEmail = process.env. CONTACT_RECIPIENT_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  const frontendUrl = (process.env. FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    if (templateId) {
      console.log(`Sending contact notification using SendGrid template: ${templateId}`);
      
      await sendEmail({
        to: recipientEmail,
        templateId: templateId,
        dynamicTemplateData: {
          submission_id:  submissionId,
          contact_name: name,
          contact_email: email,
          contact_subject: subject,
          contact_message: message,
          reply_url: `mailto:${email}`,
          current_year: new Date().getFullYear(),
          frontend_url: frontendUrl
        }
      });

      console.log(`✅ Contact notification sent to ${recipientEmail} using SendGrid template`);
    } else {
      console.log('SendGrid contact template ID not configured. Using simple fallback email.');
      
      const emailSubject = `[Contact Form] ${subject}`;
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding:  20px;">
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0;">🌴 WanderWise</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">New Contact Form Submission</p>
    </div>
    
    <div style="background: white; padding: 30px; border:  1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top:  0;">Contact Details</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background:  #f8f9fa; border:  1px solid #e0e0e0; font-weight: bold; width: 30%;">Submission ID:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">#${submissionId}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border:  1px solid #e0e0e0; font-weight:  bold;">Name:</td>
          <td style="padding: 10px; background: white; border:  1px solid #e0e0e0;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
          <td style="padding:  10px; background: white; border: 1px solid #e0e0e0;">
            <a href="mailto: ${email}" style="color: #667eea;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:  10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Subject:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${subject}</td>
        </tr>
      </table>
      
      <h3 style="color: #333; margin-top: 30px;">Message:</h3>
      <div style="background: #f8f9fa; padding:  20px; border-radius:  8px; border-left:  4px solid #667eea;">
        <p style="margin: 0; white-space:  pre-wrap;">${message}</p>
      </div>
      
      <div style="text-align: center; margin-top:  30px;">
        <a href="mailto:${email}? subject=Re:  ${encodeURIComponent(subject)}" 
           style="display:  inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reply to ${name}
        </a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
      <p>This is an automated notification from the WanderWise contact form. </p>
    </div>
    
  </div>
</body>
</html>
      `;

      const text = `
New Contact Form Submission

Submission ID: #${submissionId}
Name: ${name}
Email:  ${email}
Subject: ${subject}

Message:
${message}

---
Reply to this contact at: ${email}
      `;

      await sendEmail({
        to: recipientEmail,
        subject: emailSubject,
        html,
        text
      });

      console.log(`✅ Contact notification sent to ${recipientEmail} using simple fallback template`);
    }
  } catch (emailError) {
    console.error('❌ Failed to send contact notification email:', emailError);
    throw emailError;
  }
}

/* -------------------------------------------------
   SEND CONFIRMATION EMAIL TO USER
---------------------------------------------------*/
async function sendContactConfirmationEmail({ name, email, subject }) {
  const templateId = process.env. SENDGRID_TEMPLATE_CONTACT_CONFIRMATION_ID;
  const frontendUrl = (process.env. FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const supportEmail = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SENDGRID_FROM_EMAIL;

  try {
    if (templateId) {
      console.log(`Sending contact confirmation using SendGrid template: ${templateId}`);
      
      await sendEmail({
        to: email,
        templateId: templateId,
        dynamicTemplateData: {
          contact_name: name,
          contact_subject: subject,
          support_email: supportEmail,
          current_year: new Date().getFullYear(),
          frontend_url: frontendUrl
        }
      });

      console.log(`✅ Confirmation email sent to ${email} using SendGrid template`);
    } else {
      console.log('SendGrid confirmation template ID not configured. Using simple fallback email.');
      
      const confirmSubject = 'We received your message!';
      
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color:  #667eea; margin: 0;">🌴 WanderWise</h1>
    </div>
    
    <h2>Thank you for contacting us, ${name}!</h2>
    
    <p>We've received your message and will get back to you as soon as possible. </p>
    
    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin:  20px 0;">
      <p style="margin: 0 0 10px 0;"><strong>Your message:</strong></p>
      <p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>
    </div>
    
    <p>Our team typically responds within 24-48 hours during business days.</p>
    
    <p>In the meantime, feel free to explore: </p>
    <ul>
      <li><a href="${frontendUrl}/destinations" style="color: #667eea;">Destinations</a> - Discover Sri Lanka</li>
      <li><a href="${frontendUrl}/itinerary-planner" style="color: #667eea;">Itinerary Planner</a> - Plan your trip</li>
      <li><a href="${frontendUrl}/about" style="color: #667eea;">About Us</a> - Learn more about WanderWise</li>
    </ul>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      If you have any urgent questions, you can reach us directly at: <br>
      <a href="mailto:${supportEmail}" style="color: #667eea;">${supportEmail}</a>
    </p>
    
    <p style="font-size: 12px; color: #666;">
      WanderWise - Your Sri Lanka Travel Companion<br>
      Colombo, Sri Lanka<br>
      © ${new Date().getFullYear()} All rights reserved
    </p>
    
  </div>
</body>
</html>
      `;

      const text = `
Thank you for contacting us, ${name}!

We've received your message and will get back to you as soon as possible.

Your message:
Subject: ${subject}

Our team typically responds within 24-48 hours during business days.

---
WanderWise - Your Sri Lanka Travel Companion
${supportEmail}
      `;

      await sendEmail({
        to: email,
        subject: confirmSubject,
        html,
        text
      });

      console.log(`✅ Confirmation email sent to ${email} using simple fallback template`);
    }
  } catch (emailError) {
    console.error('❌ Failed to send confirmation email:', emailError);
  }
}

/* -------------------------------------------------
   GET CONTACT SUBMISSIONS (ADMIN)
---------------------------------------------------*/
const getContactSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT id, name, email, subject, message, status, ip_address, created_at 
      FROM contact_submissions
    `;
    const params = [];

    if (status !== 'all') {
      query += ` WHERE status = $1`;
      params.push(status);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const result = await pool.query(query, params);

    const countQuery = status !== 'all'
      ? 'SELECT COUNT(*) FROM contact_submissions WHERE status = $1'
      : 'SELECT COUNT(*) FROM contact_submissions';
    const countParams = status !== 'all' ? [status] : [];
    const countResult = await pool. query(countQuery, countParams);

    return res.status(200).json({
      success: true,
      submissions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0]. count),
        totalPages: Math.ceil(countResult.rows[0].count / limit),
      },
    });

  } catch (error) {
    console.error('Get contact submissions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submissions.',
    });
  }
};

/* -------------------------------------------------
   UPDATE CONTACT SUBMISSION STATUS (ADMIN)
---------------------------------------------------*/
const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'in-progress', 'resolved', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status.  Must be:  new, in-progress, resolved, or archived.',
      });
    }

    const result = await pool.query(
      'UPDATE contact_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully.',
      submission: result.rows[0],
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update status.',
    });
  }
};

module.exports = {
  submitContactForm,
  getContactSubmissions,
  updateContactStatus
};