'use strict';
const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');
const { sendEmail } = require('../services/emailService');
const { generateApplicationId } = require('../utils/applicationId');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Upload buffer to Cloudinary
 */
async function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// ============================================================================
// MAIN CONTROLLER FUNCTIONS
// ============================================================================

/**
 * Submit Application
 * @route POST /api/careers/apply
 * @access Public
 */
const submitApplication = async (req, res) => {
  try {
    const {
      jobId, jobTitle, jobDepartment,
      fullName, email, phone, location,
      currentRole, experience, expectedSalary, noticePeriod,
      portfolio, linkedin, github, website,
      coverLetter, howDidYouHear
    } = req.body;

    // Validate required fields
    if (!jobId || !jobTitle || !fullName || !email || !phone || !location || 
        !currentRole || !experience || !coverLetter) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate resume file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume is required'
      });
    }

    // Generate unique application ID
    const applicationId = generateApplicationId();

    // Upload resume to Cloudinary
    const folder = process.env.CLOUDINARY_RESUMES_FOLDER || 'wanderwise/resumes';
    const uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'raw',
      format: req.file.originalname.split('. ').pop(),
      public_id: `${applicationId}_${Date.now()}`
    });

    // Get client metadata
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req. get('user-agent');
    const referrer = req.get('referrer') || req.get('referer');

    // Insert application into database
    const result = await pool.query(
      `INSERT INTO job_applications (
        application_id, job_id, job_title, job_department,
        full_name, email, phone, location,
        current_position, experience_years, expected_salary, notice_period,
        portfolio_url, linkedin_url, github_url, website_url,
        resume_url, resume_filename, resume_size, resume_public_id,
        cover_letter, how_did_you_hear,
        ip_address, user_agent, referrer
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25
      ) RETURNING *`,
      [
        applicationId, jobId, jobTitle, jobDepartment || 'General',
        fullName, email, phone, location,
        currentRole, experience, expectedSalary || null, noticePeriod || null,
        portfolio || null, linkedin || null, github || null, website || null,
        uploadResult.secure_url, req.file.originalname, req. file.size, uploadResult.public_id,
        coverLetter, howDidYouHear || null,
        clientIP, userAgent, referrer
      ]
    );

    const application = result.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO application_activities (application_id, activity_type, description)
       VALUES ($1, $2, $3)`,
      [application.id, 'application_submitted', `Application submitted for ${jobTitle}`]
    );

    // Send confirmation email (non-blocking)
    sendApplicationConfirmationEmail(application).catch(err => {
      console.error('Confirmation email failed:', err);
    });

    // Send notification to HR/Admin (non-blocking)
    sendApplicationNotificationToHR(application).catch(err => {
      console.error('HR notification failed:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: applicationId,
      data: {
        id: application.id,
        applicationId: application.application_id,
        jobTitle: application.job_title,
        appliedAt: application.applied_at
      }
    });

  } catch (error) {
    console.error('Submit application error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: process.env.NODE_ENV === 'development' ? error.message :  undefined
    });
  }
};

/**
 * Get All Applications
 * @route GET /api/careers/applications
 * @access Admin/HR
 */
const getAllApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      job_id, 
      search,
      sort_by = 'applied_at',
      order = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM job_applications WHERE 1=1';
    const params = [];
    let paramCount = 0;

    // Filters
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (job_id) {
      paramCount++;
      query += ` AND job_id = $${paramCount}`;
      params.push(job_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (full_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR application_id ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Sorting
    const allowedSortFields = ['applied_at', 'full_name', 'status', 'experience_years'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'applied_at';
    const sortOrder = order. toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM job_applications WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (job_id) {
      countParamCount++;
      countQuery += ` AND job_id = $${countParamCount}`;
      countParams.push(job_id);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (full_name ILIKE $${countParamCount} OR email ILIKE $${countParamCount} OR application_id ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0]. count);

    return res.json({
      success: true,
      applications: result.rows,
      pagination: {
        page:  parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

/**
 * Get Application By ID
 * @route GET /api/careers/applications/:id
 * @access Admin/HR
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        a.*,
        j.title as job_title_full,
        j.department as job_department_full,
        j.type as job_type,
        j.location as job_location
       FROM job_applications a
       LEFT JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Get activities/timeline
    const activities = await pool.query(
      `SELECT * FROM application_activities 
       WHERE application_id = $1 
       ORDER BY performed_at DESC`,
      [id]
    );

    // Get interviews
    const interviews = await pool.query(
      `SELECT * FROM interview_schedules 
       WHERE application_id = $1 
       ORDER BY scheduled_date DESC`,
      [id]
    );

    return res.json({
      success: true,
      application: result. rows[0],
      activities:  activities.rows,
      interviews: interviews.rows
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

/**
 * Update Application Status
 * @route PUT /api/careers/applications/:id/status
 * @access Admin/HR
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, stage, priority, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Valid statuses
    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get current application
    const current = await pool.query(
      'SELECT * FROM job_applications WHERE id = $1',
      [id]
    );

    if (current.rows.length === 0) {
      return res. status(404).json({
        success: false,
        message:  'Application not found'
      });
    }

    const oldStatus = current.rows[0]. status;

    // Update application
    const updateFields = ['status = $1', 'reviewed_by = $2', 'reviewed_at = NOW()'];
    const updateValues = [status, req.user.id];
    let paramCount = 2;

    if (stage) {
      paramCount++;
      updateFields.push(`stage = $${paramCount}`);
      updateValues.push(stage);
    }

    if (priority) {
      paramCount++;
      updateFields.push(`priority = $${paramCount}`);
      updateValues.push(priority);
    }

    if (notes) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
    }

    paramCount++;
    updateValues.push(id);

    const result = await pool.query(
      `UPDATE job_applications 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    // Log activity
    await pool.query(
      `INSERT INTO application_activities (
        application_id, activity_type, old_value, new_value, 
        description, performed_by
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        'status_change',
        oldStatus,
        status,
        `Status changed from ${oldStatus} to ${status}`,
        req.user.id
      ]
    );

    // Send email notification to applicant (non-blocking)
    if (status === 'interview') {
      sendInterviewInvitationEmail(result.rows[0]).catch(err => console.error('Interview email failed:', err));
    } else if (status === 'rejected') {
      sendRejectionEmail(result.rows[0]).catch(err => console.error('Rejection email failed:', err));
    } else if (status === 'hired') {
      sendOfferEmail(result.rows[0]).catch(err => console.error('Offer email failed:', err));
    }

    return res.json({
      success: true,
      message:  'Application status updated successfully',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('Update application status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
};

/**
 * Add Note to Application
 * @route POST /api/careers/applications/:id/notes
 * @access Admin/HR
 */
const addApplicationNote = async (req, res) => {
  try {
    const { id } = req. params;
    const { note } = req.body;

    if (!note || ! note.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    // Check if application exists
    const appCheck = await pool.query(
      'SELECT id FROM job_applications WHERE id = $1',
      [id]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Add to activities
    await pool.query(
      `INSERT INTO application_activities (
        application_id, activity_type, description, performed_by
      ) VALUES ($1, $2, $3, $4)`,
      [id, 'note_added', note. trim(), req.user.id]
    );

    // Also update the notes field in application
    await pool.query(
      `UPDATE job_applications 
       SET notes = COALESCE(notes, '') || $1 || E'\n---\n'
       WHERE id = $2`,
      [`[${new Date().toISOString()}] ${req.user.email}:  ${note.trim()}`, id]
    );

    return res.json({
      success: true,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('Add application note error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add note'
    });
  }
};

/**
 * Schedule Interview
 * @route POST /api/careers/applications/:id/interview
 * @access Admin/HR
 */
const scheduleInterview = async (req, res) => {
  try {
    const { id } = req. params;
    const {
      interview_type,
      interview_mode,
      scheduled_date,
      duration_minutes,
      interviewer_ids,
      interviewer_names,
      meeting_link,
      meeting_location,
      notes
    } = req.body;

    // Validate required fields
    if (! interview_type || !interview_mode || !scheduled_date) {
      return res.status(400).json({
        success: false,
        message: 'Interview type, mode, and scheduled date are required'
      });
    }

    // Check if application exists
    const appResult = await pool.query(
      'SELECT * FROM job_applications WHERE id = $1',
      [id]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = appResult.rows[0];

    // Insert interview schedule
    const result = await pool.query(
      `INSERT INTO interview_schedules (
        application_id, interview_type, interview_mode,
        scheduled_date, duration_minutes,
        interviewer_ids, interviewer_names,
        meeting_link, meeting_location, notes,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        id, interview_type, interview_mode,
        scheduled_date, duration_minutes || 60,
        interviewer_ids || null, interviewer_names || null,
        meeting_link || null, meeting_location || null, notes || null,
        req. user.id
      ]
    );

    const interview = result. rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO application_activities (
        application_id, activity_type, description, performed_by, metadata
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        'interview_scheduled',
        `${interview_type} interview scheduled for ${new Date(scheduled_date).toLocaleString()}`,
        req.user.id,
        JSON.stringify({ interview_id: interview.id })
      ]
    );

    // Update application status to 'interview' if not already
    if (application.status !== 'interview') {
      await pool.query(
        'UPDATE job_applications SET status = $1 WHERE id = $2',
        ['interview', id]
      );
    }

    // Send interview invitation email (non-blocking)
    sendInterviewScheduleEmail(application, interview).catch(err => {
      console.error('Interview schedule email failed:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      interview: interview
    });

  } catch (error) {
    console.error('Schedule interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule interview'
    });
  }
};

/**
 * Get Application Timeline
 * @route GET /api/careers/applications/:id/timeline
 * @access Admin/HR
 */
const getApplicationTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if application exists
    const appCheck = await pool.query(
      'SELECT id FROM job_applications WHERE id = $1',
      [id]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const activities = await pool.query(
      `SELECT 
        a.*,
        u.full_name as performed_by_name,
        u.email as performed_by_email
       FROM application_activities a
       LEFT JOIN users u ON a.performed_by = u.id
       WHERE a.application_id = $1
       ORDER BY a.performed_at DESC`,
      [id]
    );

    return res.json({
      success: true,
      timeline: activities.rows
    });

  } catch (error) {
    console.error('Get application timeline error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch timeline'
    });
  }
};

// ============================================================================
// EMAIL NOTIFICATION FUNCTIONS (Private)
// ============================================================================

/**
 * Send Application Confirmation Email to Applicant
 */
async function sendApplicationConfirmationEmail(application) {
  const templateId = process.env.SENDGRID_TEMPLATE_APPLICATION_CONFIRMATION;
  const frontendUrl = (process.env. FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    if (templateId) {
      await sendEmail({
        to: application.email,
        templateId,
        dynamicTemplateData: {
          applicant_name: application.full_name,
          job_title: application.job_title,
          application_id: application.application_id,
          applied_date: new Date(application.applied_at).toLocaleDateString(),
          track_url: `${frontendUrl}/applications/track/${application.application_id}`,
          support_email: process.env.CONTACT_RECIPIENT_EMAIL || 'careers@wanderwise.com',
          current_year: new Date().getFullYear()
        }
      });
      console.log(`✅ Confirmation email sent to ${application.email}`);
    } else {
      // Fallback email
      const subject = `Application Received - ${application.job_title}`;
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background:  linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0;">🌴 WanderWise</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Application Received</p>
    </div>
    
    <div style="background: white; padding: 30px; border:  1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #667eea; margin-top: 0;">Thank you for your application!</h2>
      
      <p>Dear <strong>${application.full_name}</strong>,</p>
      
      <p>We have successfully received your application for the position of <strong>${application.job_title}</strong>.</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin:  20px 0; border-left: 4px solid #667eea;">
        <p style="margin: 0;"><strong>Application ID:</strong></p>
        <p style="font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0;">${application.application_id}</p>
        <p style="margin: 0; font-size: 14px; color: #666;">Please save this ID for future reference</p>
      </div>
      
      <h3 style="color: #333; margin-top: 30px;">What happens next? </h3>
      <ul style="color: #555; line-height: 1.8;">
        <li>📋 Our team will review your application</li>
        <li>📧 You'll hear from us within 5-7 business days</li>
        <li>📞 If shortlisted, we'll schedule an interview</li>
        <li>🎯 Track your application status anytime</li>
      </ul>
      
      <div style="text-align: center; margin:  30px 0;">
        <a href="${frontendUrl}/applications/track/${application.application_id}" 
           style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Track Application
        </a>
      </div>
      
      <p style="color: #555;">If you have any questions, feel free to reach out to us at <a href="mailto:careers@wanderwise.com" style="color: #667eea;">careers@wanderwise.com</a></p>
      
      <p style="color: #555;">Best regards,<br><strong>WanderWise Careers Team</strong></p>
    </div>
    
    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
      <p>WanderWise - Your Sri Lanka Travel Companion<br>
      Colombo, Sri Lanka<br>
      © ${new Date().getFullYear()} All rights reserved</p>
    </div>
    
  </div>
</body>
</html>
      `;
      
      await sendEmail({
        to: application.email,
        subject,
        html
      });
      console.log(`✅ Fallback confirmation email sent to ${application.email}`);
    }
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    throw error;
  }
}

/**
 * Send Application Notification to HR
 */
async function sendApplicationNotificationToHR(application) {
  const hrEmail = process.env. CAREERS_HR_EMAIL || process.env.SENDGRID_FROM_EMAIL;
  
  try {
    const subject = `New Application:  ${application.job_title} - ${application.full_name}`;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin:  0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
      <h1 style="color:  white; margin: 0;">New Job Application</h1>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
      <h2 style="color: #333; margin-top: 0;">Application Details</h2>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border:  1px solid #e0e0e0; font-weight: bold;">Position: </td>
          <td style="padding: 10px; background:  white; border: 1px solid #e0e0e0;">${application.job_title}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Applicant:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${application.full_name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Email:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;"><a href="mailto:${application.email}">${application.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Phone:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${application.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border:  1px solid #e0e0e0; font-weight:  bold;">Current Position:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${application.current_position}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Experience:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;">${application.experience_years}</td>
        </tr>
        <tr>
          <td style="padding: 10px; background: #f8f9fa; border: 1px solid #e0e0e0; font-weight: bold;">Application ID:</td>
          <td style="padding: 10px; background: white; border: 1px solid #e0e0e0;"><strong>${application.application_id}</strong></td>
        </tr>
      </table>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${application.resume_url}" 
           style="display: inline-block; padding:  12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
          📄 Download Resume
        </a>
      </div>
      
      <p style="color: #666; font-size: 14px;">Login to your admin dashboard to review the full application and manage the hiring process.</p>
    </div>
    
  </div>
</body>
</html>
    `;

    await sendEmail({
      to: hrEmail,
      subject,
      html
    });
    console.log(`✅ HR notification sent to ${hrEmail}`);
  } catch (error) {
    console.error('❌ Failed to send HR notification:', error);
    throw error;
  }
}

/**
 * Send Interview Invitation Email
 */
async function sendInterviewInvitationEmail(application) {
  try {
    const subject = `Interview Opportunity - ${application.job_title}`;
    const html = `
      <h2>Congratulations ${application.full_name}!</h2>
      <p>We are pleased to inform you that you have been shortlisted for an interview for the position of <strong>${application.job_title}</strong>.</p>
      <p>Our team will contact you soon with interview details. </p>
      <p>Application ID: ${application.application_id}</p>
      <p>Best regards,<br>WanderWise HR Team</p>
    `;

    await sendEmail({
      to: application.email,
      subject,
      html
    });
    console.log(`✅ Interview invitation sent to ${application.email}`);
  } catch (error) {
    console.error('❌ Failed to send interview invitation:', error);
  }
}

/**
 * Send Interview Schedule Email
 */
async function sendInterviewScheduleEmail(application, interview) {
  try {
    const subject = `Interview Scheduled - ${application.job_title}`;
    const interviewDate = new Date(interview. scheduled_date);
    
    const html = `
      <h2>Interview Scheduled</h2>
      <p>Dear ${application.full_name},</p>
      <p>Your interview for <strong>${application.job_title}</strong> has been scheduled. </p>
      
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Interview Type:</strong> ${interview.interview_type}</p>
        <p><strong>Mode:</strong> ${interview.interview_mode}</p>
        <p><strong>Date & Time:</strong> ${interviewDate.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${interview.duration_minutes} minutes</p>
        ${interview.meeting_link ?  `<p><strong>Meeting Link:</strong> <a href="${interview.meeting_link}">${interview.meeting_link}</a></p>` : ''}
        ${interview.meeting_location ? `<p><strong>Location:</strong> ${interview.meeting_location}</p>` : ''}
      </div>

      ${interview.notes ? `<p><strong>Additional Notes:</strong><br>${interview.notes}</p>` : ''}
      
      <p>Please confirm your availability by replying to this email.</p>
      <p>Best regards,<br>WanderWise HR Team</p>
    `;

    await sendEmail({
      to: application.email,
      subject,
      html
    });
    console.log(`✅ Interview schedule email sent to ${application.email}`);
  } catch (error) {
    console.error('❌ Failed to send interview schedule email:', error);
  }
}

/**
 * Send Rejection Email
 */
async function sendRejectionEmail(application) {
  try {
    const subject = `Application Update - ${application.job_title}`;
    const html = `
      <h2>Application Update</h2>
      <p>Dear ${application.full_name},</p>
      <p>Thank you for your interest in the <strong>${application.job_title}</strong> position at WanderWise.</p>
      <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
      <p>We appreciate the time you invested in the application process and encourage you to apply for future openings that match your skills and experience.</p>
      <p>We wish you all the best in your job search.</p>
      <p>Best regards,<br>WanderWise HR Team</p>
    `;

    await sendEmail({
      to: application.email,
      subject,
      html
    });
    console.log(`✅ Rejection email sent to ${application.email}`);
  } catch (error) {
    console.error('❌ Failed to send rejection email:', error);
  }
}

/**
 * Send Offer Email
 */
async function sendOfferEmail(application) {
  try {
    const subject = `Job Offer - ${application.job_title}`;
    const html = `
      <h2>Congratulations!  🎉</h2>
      <p>Dear ${application.full_name},</p>
      <p>We are delighted to offer you the position of <strong>${application.job_title}</strong> at WanderWise! </p>
      <p>Our HR team will contact you shortly with the offer letter and next steps.</p>
      <p>We look forward to welcoming you to our team!</p>
      <p>Best regards,<br>WanderWise HR Team</p>
    `;

    await sendEmail({
      to: application.email,
      subject,
      html
    });
    console.log(`✅ Offer email sent to ${application.email}`);
  } catch (error) {
    console.error('❌ Failed to send offer email:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module. exports = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNote,
  scheduleInterview,
  getApplicationTimeline
};