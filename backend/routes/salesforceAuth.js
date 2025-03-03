import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();


// Step 1: Redirect User to Salesforce OAuth Login (Using Org Domain)
router.get("/", (req, res) => {
  const authUrl = `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/authorize?response_type=code&client_id=${process.env.SALESFORCE_CONSUMER_KEY}&redirect_uri=${process.env.SALESFORCE_REDIRECT_URI}`;

  res.redirect(authUrl);
});

// 🔹 Step 2: Handle OAuth Callback & Exchange Code for Access Token
router.get("/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code is missing" });
  }

  try {
    const response = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.SALESFORCE_CONSUMER_KEY,
        client_secret: process.env.SALESFORCE_CONSUMER_SECRET,
        redirect_uri: process.env.SALESFORCE_REDIRECT_URI,
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
