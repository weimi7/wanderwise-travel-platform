"use strict";
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

/* -------------------------------------------------
   EMAIL HELPERS
---------------------------------------------------*/
function normalizeEmail(email) {
  if (!email) return null;
  return String(email).trim().toLowerCase();
}

function validateEmailFormat(email) {
  if (!email) return false;

  // basic RFC-like validation
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

  const cleaned = String(email).trim();

  // reject double dots or dot at start/end
  if (cleaned.includes("..")) return false;
  if (cleaned.startsWith(".") || cleaned.endsWith(".")) return false;

  return emailRegex.test(cleaned);
}


/* -------------------------------------------------
   PHONE HELPERS — Match AuthController
---------------------------------------------------*/
function normalizePhone(value) {
  if (!value) return null;
  const raw = String(value).trim();

  // Already correct international
  if (/^\+[1-9]\d{7,14}$/.test(raw)) return raw;

  const digits = raw.replace(/\D/g, "");

  // Sri Lanka "0XXXXXXXXX"
  if (/^0\d{9}$/.test(digits)) return "+94" + digits.slice(1);

  // Sri Lanka "94XXXXXXXXX"
  if (/^94\d{7,14}$/.test(digits)) return "+" + digits;

  // Generic fallback
  if (/^\d{7,15}$/.test(digits)) return "+" + digits;

  return null;
}

function isValidE164(value) {
  return !!value && /^\+[1-9]\d{7,14}$/.test(value);
}

/* =================================================
   LIST USERS
   - include avatar_url in returned rows
===================================================*/
exports.listUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const perPage = Math.min(100, Math.max(5, parseInt(req.query.perPage || "20", 10)));
    const offset = (page - 1) * perPage;
    const search = (req.query.search || "").trim();
    const role = (req.query.role || "").trim();
    const isActive = (req.query.isActive || "").trim();

    const where = [];
    const params = [];
    let idx = 1;

    if (search) {
      where.push(`(full_name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (role && role !== "all") {
      where.push(`role = $${idx}`);
      params.push(role);
      idx++;
    }
    if (isActive && isActive !== "all") {
      if (isActive === "active") {
        where.push(`(status IS NULL OR status NOT IN ('suspended','inactive','false'))`);
      } else if (isActive === "suspended" || isActive === "inactive") {
        where.push(`status = $${idx}`);
        params.push(isActive);
        idx++;
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    // count using the same where conditions
    const countRes = await pool.query(`SELECT COUNT(*)::int AS total FROM users ${whereSql}`, params);
    const total = countRes.rows[0].total;

    // add pagination params
    params.push(perPage, offset);

    const usersRes = await pool.query(
      `
      SELECT id, full_name, email, role, phone, country, avatar_url, created_at, updated_at, is_active
      FROM users
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      params
    );

    return res.json({
      success: true,
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
      users: usersRes.rows,
    });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ success: false, message: "Server error listing users" });
  }
};

/* =================================================
   GET USER
   - include avatar_url
===================================================*/
exports.getUser = async (req, res) => {
  try {
    const id = req.params.id;

    const row = await pool.query(
      `
      SELECT id, full_name, email, role, phone, country, avatar_url, created_at, updated_at, is_active
      FROM users WHERE id = $1
      `,
      [id]
    );

    if (!row.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.json({ success: true, user: row.rows[0] });
  } catch (err) {
    console.error("getUser error:", err);
    return res.status(500).json({ success: false, message: "Server error fetching user" });
  }
};

/* =================================================
   UPDATE USER (ADMIN)
   - Accept avatar_url and return it in the returned user
===================================================*/
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const allowed = ["full_name", "email", "phone", "country", "role", "password", "avatar_url", "is_active"];

    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }

    // If no updatable fields provided, return current user row instead of 400
    if (Object.keys(updates).length === 0) {
      const { rows } = await pool.query(
        "SELECT id, full_name, email, role, phone, country, avatar_url, is_active, created_at, updated_at FROM users WHERE id = $1",
        [id]
      );
      if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, user: rows[0] });
    }

    /* -------------------------------------------
       EMAIL UPDATE
    -------------------------------------------*/
    if (updates.email !== undefined) {
      const emailNorm = normalizeEmail(updates.email);

      if (!validateEmailFormat(emailNorm))
        return res.status(400).json({ success: false, message: "Invalid email format" });

      const existing = await pool.query(
        "SELECT id FROM users WHERE lower(email) = lower($1) AND id != $2",
        [emailNorm, id]
      );

      if (existing.rows.length > 0)
        return res.status(409).json({ success: false, message: "Email already in use" });

      updates.email = emailNorm;
    }

    /* -------------------------------------------
       PHONE UPDATE — MATCHES AUTH VALIDATION
    -------------------------------------------*/
    if (updates.phone !== undefined) {
      const incoming = updates.phone;

      if (!incoming || String(incoming).trim() === "") {
        updates.phone = null;
      } else {
        const normalized = normalizePhone(incoming);
        if (!normalized || !isValidE164(normalized)) {
          return res.status(400).json({
            success: false,
            message: "Invalid phone number format. Use +XXXXXXXXXXX or 0XXXXXXXXX.",
          });
        }
        updates.phone = normalized;
      }
    }

    /* -------------------------------------------
       PASSWORD UPDATE
    -------------------------------------------*/
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(String(updates.password), SALT_ROUNDS);
      delete updates.password;
    }

    /* -------------------------------------------
       ADMIN ROLE PROTECTION
    -------------------------------------------*/
    if (updates.role) {
      const cur = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
      if (!cur.rows.length)
        return res.status(404).json({ success: false, message: "User not found" });

      const curRole = cur.rows[0].role;

      if (curRole === "admin" && updates.role !== "admin") {
        const adminCountRes = await pool.query("SELECT COUNT(*)::int AS admin_count FROM users WHERE role = 'admin'");
        if (adminCountRes.rows[0].admin_count <= 1) {
          return res.status(400).json({ success: false, message: "Cannot remove last admin" });
        }
      }
    }

    /* -------------------------------------------
       BUILD DYNAMIC UPDATE SQL
    -------------------------------------------*/
    const cols = [];
    const values = [];
    let idx = 1;

    for (const [k, v] of Object.entries(updates)) {
      // column names match keys (avatar_url and status allowed)
      const colName = k === "password_hash" ? "password_hash" : k;
      cols.push(`${colName} = $${idx}`);
      values.push(v);
      idx++;
    }

    values.push(id);

    const sql = `
      UPDATE users
      SET ${cols.join(", ")}, updated_at = NOW()
      WHERE id = $${idx}
      RETURNING id, full_name, email, role, phone, country, avatar_url, is_active, created_at, updated_at
    `;

    const upd = await pool.query(sql, values);

    return res.json({ success: true, user: upd.rows[0] });
  } catch (err) {
    console.error("updateUser error:", err);
    return res.status(500).json({ success: false, message: "Server error updating user" });
  }
};

/* =================================================
   NEW: UPDATE USER EMAIL (ADMIN ONLY)
   POST /api/admin/users/:id/update-email
   Body: { email: "new@example.com" }
   - validates format
   - checks uniqueness
   - updates email and returns updated user
===================================================*/
exports.updateUserEmail = async (req, res) => {
  const id = req.params.id;
  const rawEmail = req.body?.email;

  try {
    if (!rawEmail || typeof rawEmail !== "string") {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const email = normalizeEmail(rawEmail);
    if (!validateEmailFormat(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // ensure user exists
    const userRow = await pool.query("SELECT id, email FROM users WHERE id = $1 LIMIT 1", [id]);
    if (!userRow.rows.length) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // check email not used by another user
    const dup = await pool.query("SELECT id FROM users WHERE lower(email) = lower($1) AND id != $2 LIMIT 1", [email, id]);
    if (dup.rows.length) {
      return res.status(409).json({ success: false, message: "Email already in use by another account" });
    }

    // update transactionally
    await pool.query("BEGIN");
    const upd = await pool.query(
      "UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, role, phone, country, avatar_url, is_active, created_at, updated_at",
      [email, id]
    );
    await pool.query("COMMIT");

    if (!upd.rows.length) {
      return res.status(500).json({ success: false, message: "Failed to update user email" });
    }

    return res.json({ success: true, user: upd.rows[0] });
  } catch (err) {
    try { await pool.query("ROLLBACK"); } catch (_) {}
    console.error("updateUserEmail error:", err);
    return res.status(500).json({ success: false, message: "Server error updating user email" });
  }
};

/* =================================================
   DELETE USER
===================================================*/
exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const row = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
    if (!row.rows.length)
      return res.status(404).json({ success: false, message: "User not found" });

    const role = row.rows[0].role;

    if (role === "admin") {
      const adminCountRes = await pool.query(
        "SELECT COUNT(*)::int AS admin_count FROM users WHERE role = 'admin'"
      );
      if (adminCountRes.rows[0].admin_count <= 1) {
        return res.status(400).json({ success: false, message: "Cannot delete the last admin" });
      }
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    return res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ success: false, message: "Server error deleting user" });
  }
};