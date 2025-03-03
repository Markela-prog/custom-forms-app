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
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  req.session.codeVerifier = codeVerifier;

  const authUrl = `${SALESFORCE_INSTANCE_URL}?response_type=code&client_id=${process.env.SALESFORCE_CONSUMER_KEY}&redirect_uri=${process.env.SALESFORCE_REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  
  res.redirect(authUrl);
});

// 🔹 Step 2: Handle OAuth Callback & Exchange Code for Access Token
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  const codeVerifier = req.session.codeVerifier;
  if (!codeVerifier) {
    return res.status(400).json({ error: "Missing code_verifier in session" });
  }

  try {
    const response = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SALESFORCE_CONSUMER_KEY,
        client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
        redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
        code_verifier: codeVerifier,
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, refresh_token, instance_url } = response.data;

    // ✅ Store tokens and instance_url in session (or DB)
    req.session.salesforce = { access_token, refresh_token, instance_url };

    return res.json({
      message: "✅ Salesforce authentication successful",
      access_token,
      instance_url,
    });
  } catch (error) {
    console.error(
      "🔴 Salesforce OAuth Error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      error: "Failed to exchange authorization code",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
