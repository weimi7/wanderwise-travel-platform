const { OAuth2Client } = require("google-auth-library");
const pool = require("../config/db");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { sendWelcomeEmail } = require('../helpers/emailHelpers');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

async function verifyGoogleIdToken(idToken) {
  if (!googleClient) throw new Error("GOOGLE_CLIENT_ID is not configured on the server");
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload(); // contains sub, email, email_verified, name, picture, ...
}

async function findSocialAccount(provider, providerId) {
  const res = await pool.query(
    "SELECT user_id FROM social_accounts WHERE provider = $1 AND provider_id = $2",
    [provider, providerId]
  );
  return res.rows.length ? res.rows[0] : null;
}

async function createSocialAccount(userId, provider, providerId, profile) {
  // ensure provider_profile is stored as JSON (string)
  const providerProfile = typeof profile === "string" ? profile : JSON.stringify(profile);
  await pool.query(
    `INSERT INTO social_accounts (id, user_id, provider, provider_id, provider_profile, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,NOW(),NOW())
     ON CONFLICT (provider, provider_id) DO NOTHING`,
    [uuidv4(), userId, provider, providerId, providerProfile]
  );
}

async function findUserByEmail(email) {
  const res = await pool.query("SELECT id, full_name, email, role FROM users WHERE email = $1", [
    email.toLowerCase(),
  ]);
  return res.rows.length ? res.rows[0] : null;
}

async function createUserFromProfile(profile) {
  const userId = uuidv4();
  const fullName = profile.name || (profile.email ? profile.email.split("@")[0] : "Traveler");
  const email = profile.email ? profile.email.toLowerCase() : null;

  // Pragmatic defaults to satisfy existing DB constraints:
  // - password_hash: empty string (NOT NULL in legacy schema)
  // - phone: placeholder E.164-like number so check_phone_format passes
  // - country: non-null placeholder so check_traveler_fields passes
  //
  // NOTE: These are placeholders. Long-term you should:
  // - Allow password_hash to be NULL (schema migration) AND/OR
  // - Add an auth_method/is_social flag so constraints can exempt social-only users AND/OR
  // - Prompt social users to provide phone/country before marking complete.
  const passwordHash = "";
  const phone = "+10000000000"; // placeholder E.164-like phone to satisfy format checks
  const country = "Unknown";

  const insertQuery = `
    INSERT INTO users (id, full_name, email, password_hash, role, phone, country, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW())
    RETURNING id, full_name, email, role
  `;

  try {
    const insert = await pool.query(insertQuery, [
      userId,
      fullName,
      email,
      passwordHash,
      "traveler",
      phone,
      country,
    ]);
    return insert.rows[0];
  } catch (err) {
    // Attach minimal context for higher-level handling/logging
    err.__insertContext = { userId, fullName, email, phone, country };
    throw err;
  }
}

function signJwt(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.full_name || user.fullName || "" },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Update the socialLogin function
exports.socialLogin = async (req, res) => {
  try {
    console.log("socialLogin called - body:", req.body);
  } catch (e) {
    console.warn("Unable to log req.body:", e);
  }

  try {
    const { provider, id_token, access_token } = req.body || {};
    if (!provider) return res.status(400).json({ success: false, message: "Missing provider" });

    let profile = null;

    if (provider === "google") {
      if (!id_token) return res.status(400).json({ success: false, message: "Missing id_token for Google" });
      if (! GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID is not set on the server");
        return res.status(500).json({
          success: false,
          message: "Google client not configured on server",
          error: "GOOGLE_CLIENT_ID missing",
        });
      }
      profile = await verifyGoogleIdToken(id_token);
      profile = {
        provider: "google",
        provider_id: profile.sub,
        email: profile.email,
        email_verified: profile.email_verified,
        name: profile.name,
        picture: profile.picture,
        raw:  profile,
      };
    } else {
      return res.status(400).json({ success: false, message: "Unsupported provider" });
    }

    if (!profile. email || !profile.email_verified) {
      return res
        .status(400)
        .json({ success: false, message: "Provider did not return a verified email address." });
    }

    // 1) Try to find social_account
    const sa = await findSocialAccount(provider, profile.provider_id);
    let user = null;
    let isNewUser = false;

    if (sa && sa.user_id) {
      const u = await pool.query("SELECT id, full_name, email, role FROM users WHERE id = $1", [sa.user_id]);
      user = u.rows. length ?  u.rows[0] : null;
    }

    // 2) If no social_account, try matching by email
    if (!user) {
      const existing = await findUserByEmail(profile.email);
      if (existing) {
        user = existing;
        await createSocialAccount(user. id, provider, profile.provider_id, profile.raw);
      }
    }

    // 3) If no user yet, create one
    if (!user) {
      try {
        user = await createUserFromProfile(profile);
        isNewUser = true;
      } catch (insertErr) {
        console.error("User creation INSERT error:", insertErr);

        const msg = insertErr.message || String(insertErr);
        const constraintMatch = msg.match(/violates check constraint "([^"]+)"/i);
        if (constraintMatch) {
          const constraintName = constraintMatch[1];
          console.error("Constraint violated:", constraintName);

          return res. status(500).json({
            success: false,
            message: "Social login failed due to DB constraint when creating user",
            error: msg,
            constraint: constraintName,
            suggestion: 
              "Inspect the constraint definition (pg_get_constraintdef) for the 'users' table and adjust the insert defaults or schema accordingly.",
          });
        }

        return res.status(500).json({ success: false, message: "Social login failed", error: msg });
      }

      await createSocialAccount(user.id, provider, profile.provider_id, profile.raw);
    }

    const token = signJwt(user);

    // 🎉 Send welcome email only for new users (non-blocking)
    if (isNewUser) {
      sendWelcomeEmail(user.email, user.full_name, user.role, true).catch(err => {
        console. error('Welcome email failed but social login succeeded:', err);
      });
    }

    return res. json({ success: true, user, token });
  } catch (err) {
    console.error("socialLogin error:", err);
    const payload = { success: false, message: "Social login failed", error: err.message || String(err) };
    if (process.env.NODE_ENV !== "production") payload.stack = err.stack;
    return res.status(500).json(payload);
  }
};