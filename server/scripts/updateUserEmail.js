"use strict";

// Usage:
//   node server/scripts/updateUserEmail.js <userId> <newEmail>
//
// Example:
//   node server/scripts/updateUserEmail.js 8fb30eb1-fc96-45f7-966b-226d02f52a18 thilini.jayawardena@gmail.com

require("dotenv").config();
const assert = require("assert");
const pool = require("../config/db"); // same pool used by your server code

function validateEmailFormat(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim());
}

async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length < 2) {
      console.error("Usage: node server/scripts/updateUserEmail.js <userId> <newEmail>");
      process.exit(2);
    }

    const [userId, newEmailRaw] = args;
    const newEmail = String(newEmailRaw).trim();

    if (!userId) {
      console.error("Missing userId argument.");
      process.exit(2);
    }

    if (!validateEmailFormat(newEmail)) {
      console.error("Invalid email format:", newEmail);
      process.exit(2);
    }

    console.log(`Changing email for user id ${userId} -> ${newEmail}`);

    // Check user exists
    const userRes = await pool.query("SELECT id, full_name, email FROM users WHERE id = $1 LIMIT 1", [userId]);
    if (!userRes.rows.length) {
      console.error("User not found with id:", userId);
      process.exit(3);
    }
    const user = userRes.rows[0];
    console.log("Found user:", { id: user.id, full_name: user.full_name, email: user.email });

    // Check new email is not in use by another user
    const dupRes = await pool.query("SELECT id, full_name FROM users WHERE lower(email) = lower($1) AND id != $2 LIMIT 1", [newEmail, userId]);
    if (dupRes.rows.length) {
      console.error("Email already in use by another account:", dupRes.rows[0]);
      process.exit(4);
    }

    // Update inside transaction
    await pool.query("BEGIN");
    const upd = await pool.query(
      "UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2 RETURNING id, full_name, email, updated_at",
      [newEmail, userId]
    );
    await pool.query("COMMIT");

    if (!upd.rows.length) {
      console.error("Update failed - no row returned");
      process.exit(5);
    }

    console.log("Email updated successfully:", upd.rows[0]);
    process.exit(0);
  } catch (err) {
    try { await pool.query("ROLLBACK"); } catch (_) {}
    console.error("Error updating email:", err && err.message ? err.message : err);
    process.exit(1);
  } finally {
    // close pool if supported
    if (pool && typeof pool.end === "function") {
      try { await pool.end(); } catch (_) {}
    }
  }
}

main();