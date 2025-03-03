import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import base64url from "base64url";

dotenv.config();
const router = express.Router();

// Function to generate a code verifier (random string)
function generateCodeVerifier() {
  return base64url(crypto.randomBytes(32));
}

// Function to generate a code challenge (SHA-256 hash of code verifier)
function generateCodeChallenge(codeVerifier) {
  return base64url(crypto.createHash("sha256").update(codeVerifier).digest());
}

// Step 1: Redirect User to Salesforce OAuth Login (Using Org Domain)
router.get("/", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  req.session.codeVerifier = codeVerifier;
  req.session.userId = req.user.id; // ✅ Track which user is logging in

  const authUrl = `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/authorize?response_type=code&client_id=${process.env.SALESFORCE_CONSUMER_KEY}&redirect_uri=${process.env.SALESFORCE_REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

  res.redirect(authUrl);
});

// 🔹 Step 2: Handle OAuth Callback & Exchange Code for Access Token
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code || !req.session.userId) {
    return res.status(400).json({ error: "Missing code or user session" });
  }

  try {
    const response = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SALESFORCE_CONSUMER_KEY,
        client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
        redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
        code_verifier: req.session.codeVerifier,
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, instance_url } = response.data;

    // ✅ Store with the userId
    req.session.salesforce = {
      access_token,
      instance_url,
      userId: req.session.userId,
    };

    return res.json({ message: "✅ Salesforce authentication successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to exchange authorization code" });
  }
});

/**
 * @route POST /api/salesforce/create-account
 * @desc Create an Account and a linked Contact in Salesforce
 * @access Private (Requires authentication)
 */
router.post("/create-account", async (req, res) => {
  // 🔹 Step 1: Ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  // 🔹 Step 2: Get user info from session
  const { email, username } = req.user; // Assuming `req.user` contains the logged-in user
  if (!email) {
    return res
      .status(400)
      .json({ error: "User email is required but missing" });
  }

  // 🔹 Step 3: Get additional data from request body
  const { name = username || "Anonymous User", phone } = req.body;

  try {
    // 🔹 Step 4: Get Salesforce access token from session
    const { access_token, instance_url } = req.session.salesforce || {};
    if (!access_token || !instance_url) {
      return res
        .status(401)
        .json({ error: "Not authenticated with Salesforce" });
    }

    // 🔹 Step 5: Create Account in Salesforce
    const accountResponse = await axios.post(
      `${instance_url}/services/data/v63.0/sobjects/Account`,
      { Name: name }, // Only name is required for an Account
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accountId = accountResponse.data.id;

    // 🔹 Step 6: Create Contact & Link to Account
    const contactResponse = await axios.post(
      `${instance_url}/services/data/v63.0/sobjects/Contact`,
      {
        LastName: name, // Salesforce requires LastName, using name as fallback
        Email: email, // Auto-filled from logged-in user
        Phone: phone || "", // Optional
        AccountId: accountId, // Link to created Account
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      message: "✅ Account & Contact created successfully in Salesforce",
      accountId,
      contactId: contactResponse.data.id,
    });
  } catch (error) {
    console.error(
      "🔴 Salesforce API Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      error: "Failed to create Account or Contact in Salesforce",
      details: error.response?.data || error.message,
    });
  }
});

router.get("/session", (req, res) => {
  console.log("Session Data:", req.session.salesforce); // Check logs
  if (!req.session.salesforce) {
    return res.status(401).json({ error: "Salesforce session not found" });
  }
  res.json(req.session.salesforce);
});

export default router;
