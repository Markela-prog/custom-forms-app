import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const router = express.Router();

const {
  SALESFORCE_CONSUMER_KEY,
  SALESFORCE_CONSUMER_SECRET,
  SALESFORCE_INSTANCE_URL,
  SALESFORCE_REDIRECT_URI,
} = process.env;

const generateCodeVerifier = () => {
  return crypto.randomBytes(64).toString("hex");
};

const generateCodeChallenge = (codeVerifier) => {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
};

// Step 1: Redirect to Salesforce for OAuth authentication
router.get("/login", (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  req.session.codeVerifier = codeVerifier;

  const authUrl = `${SALESFORCE_INSTANCE_URL}/services/oauth2/authorize?response_type=code&client_id=${SALESFORCE_CONSUMER_KEY}&redirect_uri=${encodeURIComponent(
    SALESFORCE_REDIRECT_URI
  )}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=full`;
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  console.log("Salesforce OAuth callback received:", req.query);

  const { code, error, error_description } = req.query;
  if (error) {
    console.error("Salesforce OAuth Error:", error, error_description);
    return res.status(400).send(`Salesforce OAuth Error: ${error_description}`);
  }

  if (!code) {
    return res.status(400).send("Authorization code missing.");
  }

  // Retrieve the Code Verifier from session (must match the one from /login)
  const codeVerifier = req.session.codeVerifier;
  if (!codeVerifier) {
    return res.status(400).send("Missing Code Verifier.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://markela-dev-ed.develop.my.salesforce.com/services/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: SALESFORCE_CONSUMER_KEY,
        client_secret: SALESFORCE_CONSUMER_SECRET,
        redirect_uri: SALESFORCE_REDIRECT_URI,
        code,
        code_verifier: codeVerifier, // ✅ Include the Code Verifier
      })
    );

    const { access_token, instance_url } = tokenResponse.data;
    console.log("Salesforce Access Token Received:", access_token);

    res.redirect(
      `/profile?salesforce_token=${access_token}&instance_url=${instance_url}`
    );
  } catch (error) {
    console.error(
      "Error getting Salesforce token:",
      error.response?.data || error.message
    );
    res.status(500).send("Authentication failed.");
  }
});

// Create Account and Contact in Salesforce
router.post("/create-account", async (req, res) => {
  const {
    salesforceToken,
    instanceUrl,
    accountName,
    firstName,
    lastName,
    email,
  } = req.body;

  if (!salesforceToken || !instanceUrl) {
    return res.status(400).json({ error: "Missing authentication details" });
  }

  try {
    // Step 1: Create Account
    const accountResponse = await axios.post(
      `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Account/`,
      { Name: accountName },
      {
        headers: {
          Authorization: `Bearer ${salesforceToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accountId = accountResponse.data.id;

    // Step 2: Create Contact linked to the Account
    const contactResponse = await axios.post(
      `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Contact/`,
      {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        AccountId: accountId,
      },
      {
        headers: {
          Authorization: `Bearer ${salesforceToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, accountId, contactId: contactResponse.data.id });
  } catch (error) {
    console.error(
      "Salesforce API Error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ error: "Failed to create Salesforce Account/Contact" });
  }
});

export default router;
