'use strict';

const pool = require('../config/db');
const crypto = require('crypto');
const shortToken = () => crypto.randomBytes(6).toString('hex');
const bcrypt = require('bcrypt');

const PDFDocument = require('pdfkit'); // npm i pdfkit

// =======================================================
// Global Design Constants
// =======================================================
const DESIGN_COLORS = {
  PRIMARY: '#0f5945', // Dark Forest Green (New Accent Color)
  SECONDARY: '#e6f3e6', // Very Light Green/Off-White (Background color for titles)
  TITLE: '#062a46', // Dark Blue (Main Titles)
  BODY: '#334155', // Slate Gray (Body Text)
  META: '#667085', // Light Gray (Dates, Footers)
  LINK: '#007bff', // Blue for links
};

const SECTION_ICONS = {
  'Schedule': '⏰',
  'Locations': '📍',
  'Activities': '✅',
  'Food Suggestions': '🍽️',
  'Budget': '💰',
  'Notes': '📝',
  'Tips': '💡',
  'Contacts': '📞',
};

// =======================================================
// Utility: clean LLM artifacts (Enhanced)
// =======================================================
function cleanLLMArtifacts(text) {
  if (!text) return '';
  let t = String(text);

  // Normalize
  try { t = t.normalize('NFC'); } catch (e) { /* ignore */ }

  // 1) Remove control / zero-width characters
  t = t.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, ' ');

  // 2) **Specific** removal of observed LLM junk patterns (e.g., 'Ø=', 'Ø<', etc.)
  t = t.replace(/Ø[<=\\p{L}\\p{N}]{1,2}/gu, ' ');

  // 3) Replace long clusters of non-alphanumeric symbols (junk like "Ø=ÝR") with a single space
  t = t.replace(/([^\p{L}\p{N}\p{P}\s]){2,}/gu, ' ');

  // 4) Collapse repeated punctuation (keep markdown markers like ** and #)
  t = t.replace(/\*{3,}/g, '**');
  t = t.replace(/#{3,}\s*/g, '### ');
  // Use a more neutral dash
  t = t.replace(/[-–—]{2,}/g, '–');

  // 5) Trim each line, preserve paragraph breaks
  t = t.split(/\r?\n/).map(s => s.trim()).join('\n');

  // 6) Collapse multiple blank lines
  t = t.replace(/\n{3,}/g, '\n\n');

  // 7) Trim overall
  return t.trim();
}

// -------------------------
// Preset handlers (unchanged)
// -------------------------
const createPreset = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, payload, is_public = false } = req.body;
    if (!name || !payload) {
      return res.status(400).json({ success: false, message: 'name and payload are required' });
    }

    const insertQuery = `
      INSERT INTO planner_presets (user_id, name, payload, is_public)
      VALUES ($1, $2, $3::jsonb, $4)
      RETURNING id, user_id, name, payload, is_public, created_at
    `;
    const values = [user.id, name, payload, is_public];
    const { rows } = await pool.query(insertQuery, values);

    return res.status(201).json({ success: true, preset: rows[0] });
  } catch (err) {
    console.error('❌ createPreset error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save preset' });
  }
};

const listPresets = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { rows } = await pool.query(
      'SELECT id, name, payload, is_public, created_at FROM planner_presets WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    );
    return res.status(200).json({ success: true, presets: rows });
  } catch (err) {
    console.error('❌ listPresets error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load presets' });
  }
};

const getPreset = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Preset id required' });

    const { rows } = await pool.query('SELECT * FROM planner_presets WHERE id = $1 LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Preset not found' });

    const preset = rows[0];
    if (preset.user_id !== user.id && !preset.is_public && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    return res.status(200).json({ success: true, preset });
  } catch (err) {
    console.error('❌ getPreset error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get preset' });
  }
};

const deletePreset = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Preset id required' });

    const { rows } = await pool.query('DELETE FROM planner_presets WHERE id = $1 AND user_id = $2 RETURNING id', [id, user.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Preset not found or not owned by you' });

    return res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('❌ deletePreset error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete preset' });
  }
};

const createShare = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { expires_at = null, password = null } = req.body;

    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { rows: presetRows } = await pool.query('SELECT id FROM planner_presets WHERE id = $1 AND user_id = $2 LIMIT 1', [id, user.id]);
    if (presetRows.length === 0) return res.status(404).json({ success: false, message: 'Preset not found or not owned by you' });

    const token = shortToken();
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const insertQ = `
      INSERT INTO planner_shares (token, preset_id, expires_at, access_count, password_hash)
      VALUES ($1, $2, $3, 0, $4)
      RETURNING token, preset_id, expires_at, access_count, created_at
    `;
    const { rows } = await pool.query(insertQ, [token, id, expires_at, passwordHash]);

    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/share/${token}`;

    return res.status(201).json({ success: true, share: rows[0], url });
  } catch (err) {
    console.error('❌ createShare error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create share' });
  }
};

const getSharedPreset = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ success: false, message: 'Token required' });

    const q = `
      SELECT s.token, s.expires_at, s.access_count, p.id AS preset_id, p.name, p.payload, p.is_public
      FROM planner_shares s
      JOIN planner_presets p ON p.id = s.preset_id
      WHERE s.token = $1
      LIMIT 1
    `;
    const { rows } = await pool.query(q, [token]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Share not found' });

    const share = rows[0];
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return res.status(410).json({ success: false, message: 'Share expired' });
    }

    pool.query('UPDATE planner_shares SET access_count = access_count + 1 WHERE token = $1', [token]).catch((e) => console.error('increment share access_count err', e));

    return res.status(200).json({
      success: true,
      preset: {
        id: share.preset_id,
        name: share.name,
        payload: share.payload
      }
    });
  } catch (err) {
    console.error('❌ getSharedPreset error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get share' });
  }
};

// =======================================================
// PDFKit generator (Refactored for Design)
// =======================================================

function splitIntoDays(text) {
  if (!text) return [{ title: 'Itinerary', body: '' }];
  const lines = String(text).split(/\r?\n/);
  const dayRe = /^(?:#{1,6}\s*)?(?:day)\s*(\d{1,2})(?:\s*[-–—:]\s*(.*))?/i;
  const sections = [];
  let current = { title: 'Overview', lines: [] };

  for (const ln of lines) {
    const t = ln.trim();
    const m = t.match(dayRe);
    if (m) {
      if (current.lines.length || current.title !== 'Overview') sections.push(current);
      current = { title: `Day ${m[1]}${m[2] ? ' — ' + m[2].trim() : ''}`, lines: [] };
      continue;
    }
    const h = t.match(/^#{1,6}\s*(Day\s*\d+.*)/i);
    if (h) {
      if (current.lines.length || current.title !== 'Overview') sections.push(current);
      current = { title: h[1].trim(), lines: [] };
      continue;
    }
    current.lines.push(ln);
  }
  if (current.lines.length || current.title !== 'Overview') sections.push(current);
  if (!sections.length) return [{ title: 'Itinerary', body: text }];
  return sections.map(s => ({ title: s.title, body: s.lines.join('\n') }));
}

// Global placeholder for ensureSpaceLocal (now defined in main function)
let ensureSpaceLocal = () => {};

/**
 * Renders blocks of text, handling markdown-like formatting (bold, lists, headers).
 * @param {PDFDocument} doc - The PDFKit document instance.
 * @param {string} text - The markdown text content.
 * @param {function} writeLine - The function to write a line of text.
 * @param {number} maxWidth - The available width for text.
 */
function renderTextBlocks(doc, text, writeLine, maxWidth) {
  if (!text) return;
  const lines = String(text).split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i].trim();

    if (ln === '') {
      writeLine('', 8);
      i++;
      continue;
    }

    // 1. Handle Bulleted Lists
    if (/^[-*]\s+/.test(ln)) {
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const item = lines[i].trim().replace(/^[-*]\s+/, '');
        // Using a clear, distinct bullet with an indent
        writeLine(`• ${item}`, 6, 20, { size: 11, color: DESIGN_COLORS.BODY });
        i++;
      }
      continue;
    }

    // 2. Handle Markdown Headers (#)
    const hMatch = ln.match(/^#{1,6}\s*(.+)$/);
    if (hMatch) {
      // Use a consistent subsection style
      writeLine(hMatch[1], 10, 0, { font: 'Helvetica-Bold', size: 14, color: DESIGN_COLORS.TITLE });
      i++;
      continue;
    }

    // 3. Handle **Section Headers** (e.g., **Schedule**, **Locations**)
    const sectionMatch = ln.match(/^\*\*([^\*]+)\*\*(.*)/);
    if (sectionMatch) {
      const sectionTitle = sectionMatch[1].trim();
      const sectionBody = sectionMatch[2].trim();
      const icon = SECTION_ICONS[sectionTitle] || '📌';

      // Ensure space for the header block
      ensureSpaceLocal(30, doc);

      // Render the section header line
      doc.font('Helvetica-Bold').fontSize(14).fillColor(DESIGN_COLORS.PRIMARY).text(`${icon} ${sectionTitle}`, doc.x, doc.y);
      doc.moveDown(0.2);
      
      // Render the remaining text on the line (if any) as normal text
      if (sectionBody) {
        writeLine(sectionBody, 6, 0, { size: 11, color: DESIGN_COLORS.BODY });
      }

      doc.moveDown(0.4); // Add space after the section header
      y = doc.y;
      i++;
      continue;
    }

    // 4. Handle Bold Text inline (**...**)
    const parts = ln.split(/\*\*/);
    if (parts.length > 1) {
      doc.font('Helvetica').fontSize(11).fillColor(DESIGN_COLORS.BODY);
      const height = doc.heightOfString(ln, { width: maxWidth });
      ensureSpaceLocal(height + 8, doc);

      let currentX = doc.x;
      let currentY = doc.y;
      
      for (let j = 0; j < parts.length; j++) {
        const p = parts[j];
        if (j % 2 === 1) {
          // Bold (and colored for visual separation)
          doc.font('Helvetica-Bold').fillColor(DESIGN_COLORS.TITLE);
        } else {
          // Normal text
          doc.font('Helvetica').fillColor(DESIGN_COLORS.BODY);
        }

        const opts = { continued: j !== parts.length - 1, width: maxWidth - (currentX - doc.x) };
        if (doc.y > currentY) {
            // Text wrapped to a new line, need to reset currentX
            currentX = doc.x;
            currentY = doc.y;
            opts.continued = false;
        }

        // Check for links (simple link detection: if part contains a URL pattern)
        const linkMatch = p.match(/(\w+:\/\/[^\s]+)/);
        if (linkMatch) {
            const url = linkMatch[0];
            const preLink = p.substring(0, linkMatch.index);
            const postLink = p.substring(linkMatch.index + url.length);

            // Print text before link
            doc.text(preLink, { continued: true });
            currentX = doc.x;
            currentY = doc.y;

            // Print the link with link styling and functionality
            doc.fillColor(DESIGN_COLORS.LINK).text(url, { link: url, continued: true, underline: true });
            doc.fillColor(j % 2 === 1 ? DESIGN_COLORS.TITLE : DESIGN_COLORS.BODY); // reset color
            currentX = doc.x;
            currentY = doc.y;
            
            // Print text after link
            doc.text(postLink, opts);

        } else {
            // No link, print normally
            doc.text(p, opts);
        }
      }
      doc.text('', { continued: false });
      doc.moveDown(0.25);
      y = doc.y;
      i++;
      continue;
    }

    // 5. Default Paragraph/Line
    writeLine(ln, 6, 0, { size: 11, color: DESIGN_COLORS.BODY });
    i++;
  }
}

async function pdfBufferFromTextWithPDFKit(itineraryText, title = 'WanderWise Itinerary', destinations = '') {
  const cleaned = cleanLLMArtifacts(itineraryText);

  const doc = new PDFDocument({ size: 'A4', margin: 48, bufferPages: true }); // Enable bufferPages for total page count
  const stream = doc.pipe(require('stream').PassThrough());

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const marginLeft = doc.page.margins.left;
  const marginRight = doc.page.margins.right;
  const usableWidth = pageWidth - marginLeft - marginRight;
  let y = doc.y;

  function ensureSpace(spaceNeeded) {
    if (y + spaceNeeded > pageHeight - doc.page.margins.bottom - 20) { // Keep some buffer for footer
      doc.addPage();
      y = doc.y;
    }
  }

  // overwrite global placeholder
  ensureSpaceLocal = (spaceNeeded, d) => {
    if (y + spaceNeeded > pageHeight - d.page.margins.bottom - 20) {
      d.addPage();
      y = d.y;
    }
  };

  /**
   * Helper function to write text with styling and handle vertical positioning.
   */
  function writeLine(text, spacing = 6, indent = 0, opts = {}) {
    const font = opts.font || 'Helvetica';
    const size = opts.size || 12;
    const color = opts.color || DESIGN_COLORS.BODY;
    const underline = opts.underline || false;
    doc.font(font).fontSize(size).fillColor(color);
    const availableWidth = usableWidth - indent;
    
    // measure height precisely
    const measured = doc.heightOfString(text, { width: availableWidth });
    ensureSpace(measured + spacing);
    
    // apply indent by moving x temporarily
    const curX = doc.x;
    doc.text(text, curX + indent, doc.y, { width: availableWidth, underline: underline });
    doc.x = curX; // restore X
    
    y = doc.y + spacing;
    doc.moveTo(doc.x, doc.y);
  }
  
  /**
   * Adds a page footer with the title and page number.
   */
  function addFooter(doc) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      const isCover = (pages.start + i) === 0;

      // Draw horizontal line
      doc.save();
      doc.strokeColor(DESIGN_COLORS.META).lineWidth(0.5).moveTo(doc.page.margins.left, doc.page.height - 30).lineTo(doc.page.width - doc.page.margins.right, doc.page.height - 30).stroke();
      doc.restore();

      doc.font('Helvetica').fontSize(8).fillColor(DESIGN_COLORS.META);

      // Left aligned: Itinerary Title
      doc.text(title, doc.page.margins.left, doc.page.height - 25, {
        width: usableWidth / 2,
        align: 'left'
      });
      
      // Right aligned: Page X of Y
      doc.text(`Page ${pages.start + i + 1} of ${pages.count}`, 0, doc.page.height - 25, {
        align: 'right'
      });
    }
  }

  try {
    // =======================================================
    // Cover Page
    // =======================================================
    // Draw a decorative bar on the top
    doc.rect(0, 0, pageWidth, 20).fill(DESIGN_COLORS.PRIMARY);
    doc.moveDown(1.5);

    // Title Block
    doc.font('Helvetica-Bold').fontSize(36).fillColor(DESIGN_COLORS.TITLE).text(title, { align: 'center' });
    doc.moveDown(0.2);
    doc.font('Helvetica-Oblique').fontSize(16).fillColor(DESIGN_COLORS.PRIMARY).text('Your Personalized Journey', { align: 'center' });
    doc.moveDown(1.5);
    
    // Metadata Block
    const metaBlockWidth = usableWidth * 0.7;
    const metaX = marginLeft + (usableWidth - metaBlockWidth) / 2;
    doc.x = metaX;
    
    doc.font('Helvetica-Bold').fontSize(12).fillColor(DESIGN_COLORS.BODY).text('Trip Details:', { align: 'left' });
    doc.moveDown(0.2);
    
    doc.font('Helvetica').fontSize(10).fillColor(DESIGN_COLORS.META).text(`Destinations: `, { continued: true }).fillColor(DESIGN_COLORS.BODY).text(destinations || 'N/A', { width: metaBlockWidth });
    doc.moveDown(0.2);
    
    doc.font('Helvetica').fillColor(DESIGN_COLORS.META).text(`Generated: `, { continued: true }).fillColor(DESIGN_COLORS.BODY).text(`${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, { width: metaBlockWidth });
    doc.moveDown(1);
    
    // Overview Section
    doc.font('Helvetica-Bold').fontSize(18).fillColor(DESIGN_COLORS.TITLE).text('Overview', { align: 'center', underline: true });
    doc.moveDown(0.5);

    doc.x = marginLeft;
    if (cleaned && cleaned.length > 0) {
      // Find the first paragraph(s) before the first 'Day' section for the overview
      const firstDayIndex = cleaned.search(/^(?:#{1,6}\s*)?(?:day)\s*\d{1,2}/im);
      const overviewText = firstDayIndex !== -1 ? cleaned.substring(0, firstDayIndex).trim() : cleaned.split(/\n\s*\n/).slice(0, 2).join('\n\n');
      renderTextBlocks(doc, overviewText, writeLine, usableWidth);
    } else {
      writeLine('No itinerary content available. Please generate content before creating the PDF.', 8);
    }
    y = doc.y;
    
    // =======================================================
    // Table of Contents
    // =======================================================
    doc.addPage();
    y = doc.y;
    doc.font('Helvetica-Bold').fontSize(16).fillColor(DESIGN_COLORS.TITLE).text('Table of Contents', { underline: false });
    doc.moveDown(0.8);
    
    const daySections = splitIntoDays(cleaned);
    doc.font('Helvetica').fontSize(11).fillColor(DESIGN_COLORS.BODY);
    daySections.forEach((d, idx) => {
      // Draw a line with a dotted effect
      doc.text(`${idx + 1}. ${d.title}`, { continued: false });
      // Note: Page numbers are hard to calculate accurately before the loop, so we skip page numbers in the TOC for simplicity.
      doc.moveDown(0.2);
    });

    // =======================================================
    // Day-by-Day Itinerary
    // =======================================================
    for (let i = 0; i < daySections.length; i++) {
      const d = daySections[i];
      doc.addPage();
      y = doc.y;

      // Highlighted Day Title Block
      doc.save();
      doc.fillColor(DESIGN_COLORS.SECONDARY)
         .rect(marginLeft, doc.y - 5, usableWidth, 30)
         .fill();
      doc.fillColor(DESIGN_COLORS.PRIMARY)
         .rect(marginLeft, doc.y - 5, 5, 30) // Left accent bar
         .fill();
      doc.font('Helvetica-Bold').fontSize(16).fillColor(DESIGN_COLORS.TITLE).text(d.title, marginLeft + 15, doc.y + 2);
      doc.restore();
      doc.moveDown(0.8);
      y = doc.y;

      renderTextBlocks(doc, d.body, writeLine, usableWidth);

      doc.moveDown(0.5);
      doc.font('Helvetica-Oblique').fontSize(9).fillColor(DESIGN_COLORS.META).text(`— End of ${d.title} —`, { align: 'center' });
    }

    // =======================================================
    // Additional Tips/Notes Page
    // =======================================================
    doc.addPage();
    y = doc.y;
    doc.font('Helvetica-Bold').fontSize(18).fillColor(DESIGN_COLORS.TITLE).text('Additional Tips & Notes', { underline: false });
    doc.moveDown(0.8);
    
    // Find content after the last day section
    const lastDayIndex = cleaned.lastIndexOf(`Day ${daySections.length}`);
    let remaining = '';
    if (lastDayIndex !== -1) {
        // Simple heuristic: find the content after the last day's body ends
        const lastDayTitle = daySections[daySections.length - 1].title;
        const lastDayStart = cleaned.indexOf(lastDayTitle);
        if (lastDayStart !== -1) {
            const contentAfterLastDay = cleaned.substring(lastDayStart + lastDayTitle.length);
            // Split by day pattern to ensure we only get content *after* the last day block
            const parts = contentAfterLastDay.split(/^(?:#{1,6}\s*)?(?:day)\s*\d{1,2}/im);
            if (parts.length > 1) {
                // This means the LLM has generated more 'Day X' sections than were parsed, just take the content after the last one we successfully parsed.
                remaining = parts[parts.length - 1].trim();
            } else {
                // If no more day markers, just take the rest
                remaining = contentAfterLastDay.trim();
            }
        }
    } else {
        // Fallback for an itinerary without explicit Day markers
        const dayContentLength = daySections.reduce((acc, d) => acc + d.body.length, 0);
        remaining = cleaned.substring(dayContentLength).trim();
    }


    if (remaining && remaining.trim()) {
      renderTextBlocks(doc, remaining, writeLine, usableWidth);
    } else {
      writeLine('Safe travels! Remember to check local guidelines and have the necessary emergency contacts.', 8);
    }

    // =======================================================
    // Finalization
    // =======================================================
    doc.flushPages();
    addFooter(doc); // Apply footer to all pages now that page count is known
    doc.end();

    // Collect stream chunks into buffer
    const chunks = [];
    await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);
    return buffer;
  } catch (err) {
    // bubble error so endpoints log it
    throw err;
  }
}

// -------------------------
// PDF endpoints (PDFKit only) (unchanged)
// -------------------------

const generatePdf = async (req, res) => {
  const user = req.user;
  const { id } = req.params;

  if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
  if (!id) return res.status(400).json({ success: false, message: 'Preset id required' });

  try {
    const { rows } = await pool.query('SELECT * FROM planner_presets WHERE id = $1 LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Preset not found' });

    const preset = rows[0];

    if (preset.user_id !== user.id && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed to export this preset' });
    }

    const itineraryText = preset.payload?.generatedItinerary || JSON.stringify(preset.payload || {}, null, 2);
    const title = preset.name || 'WanderWise Itinerary';
    const destinations = Array.isArray(preset.payload?.destinations) ? preset.payload.destinations.join(', ') : (preset.payload?.destinations || '');

    try {
      const pdfBuffer = await pdfBufferFromTextWithPDFKit(itineraryText, title, destinations);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="itinerary-${preset.id}.pdf"`);
      return res.send(pdfBuffer);
    } catch (pdfErr) {
      console.error('PDFKit generation failed (preset):', pdfErr && (pdfErr.stack || pdfErr));
      return res.status(500).json({ success: false, message: 'Failed to generate PDF with fallback generator' });
    }
  } catch (err) {
    console.error('❌ generatePdf error (PDFKit):', err && (err.stack || err));
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

const generatePdfFromContent = async (req, res) => {
  try {
    const { title = 'WanderWise Itinerary', itinerary = '', author = null, destinations = '' } = req.body || {};
    if (!itinerary || String(itinerary).trim().length === 0) {
      return res.status(400).json({ success: false, message: 'itinerary content required' });
    }

    try {
      const pdfBuffer = await pdfBufferFromTextWithPDFKit(itinerary, title, destinations || '');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="itinerary.pdf"`);
      return res.send(pdfBuffer);
    } catch (pdfErr) {
      console.error('PDFKit generation failed (content):', pdfErr && (pdfErr.stack || pdfErr));
      return res.status(500).json({ success: false, message: 'Failed to generate PDF with fallback generator' });
    }
  } catch (err) {
    console.error('❌ generatePdfFromContent error (outer):', err && (err.stack || err));
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

module.exports = {
  createPreset,
  listPresets,
  getPreset,
  deletePreset,
  createShare,
  getSharedPreset,
  generatePdf,
  generatePdfFromContent
};