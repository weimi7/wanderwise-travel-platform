'use strict';
const pool = require('../config/db');

// Get all active jobs
exports.getAllJobs = async (req, res) => {
  try {
    const { department, type, location, status = 'active' } = req. query;
    
    let query = 'SELECT * FROM jobs WHERE status = $1';
    const params = [status];
    let paramCount = 1;

    if (department) {
      paramCount++;
      query += ` AND department = $${paramCount}`;
      params.push(department);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (location) {
      paramCount++;
      query += ` AND location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    query += ' ORDER BY posted_date DESC';

    const result = await pool.query(query, params);

    return res.json({
      success: true,
      jobs: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND status = $2',
      [id, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.json({
      success: true,
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch job'
    });
  }
};

// Search jobs
exports.searchJobs = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await pool.query(
      `SELECT * FROM jobs 
       WHERE status = 'active' 
       AND (
         title ILIKE $1 OR 
         description ILIKE $1 OR 
         department ILIKE $1 OR
         $2 = ANY(skills)
       )
       ORDER BY posted_date DESC`,
      [`%${q}%`, q]
    );

    return res.json({
      success: true,
      jobs: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Search jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search jobs'
    });
  }
};

// Create job (Admin only)
exports.createJob = async (req, res) => {
  try {
    const {
      title, department, type, location, salary_range,
      experience_required, description, overview, skills,
      responsibilities, requirements, nice_to_have,
      perks, benefits, urgency, openings, team_size,
      team_manager, team_culture, application_process
    } = req.body;

    const result = await pool.query(
      `INSERT INTO jobs (
        title, department, type, location, salary_range,
        experience_required, description, overview, skills,
        responsibilities, requirements, nice_to_have,
        perks, benefits, urgency, openings, team_size,
        team_manager, team_culture, application_process,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *`,
      [
        title, department, type, location, salary_range,
        experience_required, description, overview, skills,
        responsibilities, requirements, nice_to_have,
        perks, benefits, urgency || 'normal', openings || 1,
        team_size, team_manager, team_culture, application_process,
        req. user.id
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Create job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job'
    });
  }
};

// Update job (Admin only)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build dynamic update query
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(id);

    const result = await pool.query(
      `UPDATE jobs SET ${setClause} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.json({
      success: true,
      message: 'Job updated successfully',
      job: result.rows[0]
    });
  } catch (error) {
    console.error('Update job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
};

// Delete job (Admin only)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req. params;

    // Soft delete by changing status
    const result = await pool.query(
      'UPDATE jobs SET status = $1 WHERE id = $2 RETURNING id',
      ['closed', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    return res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    return res.status(500).json({
      success: false,
      message:  'Failed to delete job'
    });
  }
};