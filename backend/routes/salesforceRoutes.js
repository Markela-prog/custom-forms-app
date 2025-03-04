import express from "express";
import axios from "axios";
import pkceChallenge from "pkce-challenge";
import passport from "passport";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSalesforceAccountAndContact,
  disconnectSalesforce,
} from "../services/salesforceService.js";

const router = express.Router();

// ✅ Step 1: Start OAuth flow (Salesforce Login)
router.get("/connect", (req, res) => {
  // Generate PKCE Challenge
  const pkce = pkceChallenge();
  req.session.code_verifier = pkce.code_verifier;
  req.session.code_challenge = pkce.code_challenge;
  req.session.save(); // Save session

  // Redirect to Salesforce Auth URL with PKCE
  const authUrl = `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/authorize?response_type=code&client_id=${process.env.SALESFORCE_CONSUMER_KEY}&redirect_uri=${process.env.SALESFORCE_REDIRECT_URI}&state=securestate&code_challenge=${pkce.code_challenge}&code_challenge_method=S256`;

  console.log("✅ [Salesforce] Redirecting to Authorization URL:", authUrl);
  res.redirect(authUrl);
});

// ✅ Step 2: OAuth Callback Route
router.get("/callback", async (req, res) => {
  console.log("✅ [Salesforce] Callback Hit");
  console.log("🔹 [Query Params]:", req.query);

  if (!req.query.code) {
    console.error("🚨 [Salesforce Error]: No `code` received");
    return res
      .status(400)
      .json({ message: "Salesforce OAuth failed: No code received" });
  }

  // Retrieve `code_verifier` from session
  const codeVerifier = req.session.code_verifier;
  if (!codeVerifier) {
    console.error("🚨 [Salesforce Error]: Missing code_verifier in session");
    return res.status(400).json({ message: "Missing PKCE code verifier" });
  }

  try {
    // Exchange Authorization Code for Access Token
    const { data: tokenResponse } = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SALESFORCE_CONSUMER_KEY,
        client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
        redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
        code: req.query.code,
        code_verifier: codeVerifier, // ✅ Use stored verifier
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("✅ [Salesforce] Access Token:", tokenResponse.access_token);

    res.redirect(`${process.env.FRONTEND_URL}/profile?connected=true`);
  } catch (error) {
    console.error(
      "❌ [Salesforce] Error Exchanging Code for Token:",
      error.response?.data || error
    );
    return res
      .status(500)
      .json({ message: "Failed to exchange code for token" });
  }
});

// ✅ Create Salesforce Account
router.post("/create-account", protect, async (req, res) => {
  try {
    const result = await createSalesforceAccountAndContact(req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Disconnect from Salesforce
router.post("/disconnect", protect, async (req, res) => {
  try {
    await disconnectSalesforce(req.user.id);
    res.json({ message: "Disconnected from Salesforce" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
