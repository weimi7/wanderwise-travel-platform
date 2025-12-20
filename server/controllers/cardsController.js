'use strict';
/**
 * Cards controller - basic CRUD for saved cards.
 *
 * SECURITY NOTICE:
 * - This example demonstrates storing card PAN encrypted in the DB for demo purposes only.
 * - DO NOT use this in production unless you are fully PCI compliant.
 * - Recommended: integrate a PCI-compliant provider (Stripe/Adyen/Braintree) and store only tokens.
 *
 * API:
 * GET    /api/users/cards                -> list cards for authenticated user
 * POST   /api/users/cards                -> add new card (expects card_number, expiry, card_holder, card_type/brand)
 * DELETE /api/users/cards/:id            -> delete saved card
 * POST   /api/users/cards/:id/default    -> set default card
 */

const crypto = require('crypto');
const pool = require("../config/db");
const { v4: uuidv4 } = require('uuid');

// derive 32-byte key from env key (must be provided)
function getKey() {
  const raw = process.env.CARD_ENCRYPTION_KEY || 'fallback-card-key';
  // produce 32 bytes
  return crypto.createHash('sha256').update(String(raw)).digest();
}

function encryptPan(pan) {
  if (!pan) return null;
  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM recommended 12 bytes
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
  const enc = Buffer.concat([cipher.update(String(pan), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { enc, iv, tag };
}

function parseExpiry(expiry) {
  // Accept MM/YY or MM/YYYY or object
  if (!expiry) return { month: null, year: null };
  const v = String(expiry).trim();
  const mmYY = v.match(/^(\d{1,2})[\/\-](\d{2,4})$/);
  if (mmYY) {
    let month = parseInt(mmYY[1], 10);
    let year = parseInt(mmYY[2], 10);
    if (year < 100) {
      // convert 2-digit year
      const base = new Date().getFullYear();
      const century = Math.floor(base / 100) * 100;
      year = century + year;
    }
    return { month, year };
  }
  // fallback: not parseable
  return { month: null, year: null };
}

async function listCards(req, res) {
  try {
    const userId = req.user.id;
    const q = 'SELECT id, user_id, card_holder, card_type, brand, last4, expiry_month, expiry_year, is_default, created_at FROM user_cards WHERE user_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(q, [userId]);
    return res.json({ success: true, cards: rows });
  } catch (err) {
    console.error('listCards error', err);
    return res.status(500).json({ success: false, message: 'Failed to list cards' });
  }
}

async function createCard(req, res) {
  try {
    const userId = req.user.id;
    const { card_number, card_holder, brand, card_type, expiry } = req.body;

    if (!card_number || !card_holder || !expiry) {
      return res.status(400).json({ success: false, message: 'card_number, card_holder and expiry are required' });
    }

    // Do not allow CVC here (should never be stored)
    // parse expiry
    const { month, year } = parseExpiry(expiry);
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Invalid expiry format. Use MM/YY or MM/YYYY.' });
    }

    // Keep only digits for PAN
    const panDigits = String(card_number).replace(/\D/g, '');
    if (panDigits.length < 13 || panDigits.length > 19) {
      return res.status(400).json({ success: false, message: 'Invalid card number length' });
    }

    const last4 = panDigits.slice(-4);

    // encrypt PAN (DEMO only)
    const { enc, iv, tag } = encryptPan(panDigits);

    // create record
    const id = uuidv4();

    // If user has no cards yet, mark as default
    const existing = await pool.query('SELECT 1 FROM user_cards WHERE user_id = $1 LIMIT 1', [userId]);
    const isDefault = existing.rows.length === 0;

    const insertSql = `
      INSERT INTO user_cards (
        id, user_id, card_holder, card_type, brand, last4,
        expiry_month, expiry_year, encrypted_pan, pan_iv, pan_tag, is_default, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())
      RETURNING id, user_id, card_holder, card_type, brand, last4, expiry_month, expiry_year, is_default, created_at
    `;
    const values = [id, userId, card_holder, card_type || brand || null, brand || null, last4, month, year, enc, iv, tag, isDefault];

    const { rows } = await pool.query(insertSql, values);
    return res.status(201).json({ success: true, card: rows[0] });
  } catch (err) {
    console.error('createCard error', err);
    return res.status(500).json({ success: false, message: 'Failed to save card' });
  }
}

async function deleteCard(req, res) {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    // ensure belongs to user
    const check = await pool.query('SELECT id, is_default FROM user_cards WHERE id = $1 AND user_id = $2', [cardId, userId]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Card not found' });

    const { is_default } = check.rows[0];

    await pool.query('DELETE FROM user_cards WHERE id = $1 AND user_id = $2', [cardId, userId]);

    // if deleted card was default, set another card as default (most recent)
    if (is_default) {
      const pick = await pool.query('SELECT id FROM user_cards WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [userId]);
      if (pick.rows.length) {
        await pool.query('UPDATE user_cards SET is_default = TRUE WHERE id = $1', [pick.rows[0].id]);
      }
    }

    return res.json({ success: true, message: 'Card deleted' });
  } catch (err) {
    console.error('deleteCard error', err);
    return res.status(500).json({ success: false, message: 'Failed to delete card' });
  }
}

async function setDefault(req, res) {
  try {
    const userId = req.user.id;
    const cardId = req.params.id;
    // ensure belongs to user
    const check = await pool.query('SELECT id FROM user_cards WHERE id = $1 AND user_id = $2', [cardId, userId]);
    if (!check.rows.length) return res.status(404).json({ success: false, message: 'Card not found' });

    // unset other defaults and set this one
    await pool.query('BEGIN');
    await pool.query('UPDATE user_cards SET is_default = FALSE WHERE user_id = $1', [userId]);
    await pool.query('UPDATE user_cards SET is_default = TRUE WHERE id = $1', [cardId]);
    await pool.query('COMMIT');

    return res.json({ success: true, message: 'Default card set' });
  } catch (err) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('setDefault error', err);
    return res.status(500).json({ success: false, message: 'Failed to set default card' });
  }
}

module.exports = {
  listCards,
  createCard,
  deleteCard,
  setDefault,
};