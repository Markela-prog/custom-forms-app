import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const {
  SALESFORCE_CONSUMER_KEY,
  SALESFORCE_CONSUMER_SECRET,
  SALESFORCE_INSTANCE_URL,
  SALESFORCE_REDIRECT_URI,
} = process.env;

// Step 1: Redirect to Salesforce for OAuth authentication
router.get("/login", (req, res) => {
  const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${SALESFORCE_CONSUMER_KEY}&redirect_uri=${encodeURIComponent(
    SALESFORCE_REDIRECT_URI
  )}&scope=full`;
  res.redirect(authUrl);
});

// Step 2: Handle Salesforce OAuth callback
router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Authorization code missing.");

  try {
    const tokenResponse = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: SALESFORCE_CONSUMER_KEY,
        client_secret: SALESFORCE_CONSUMER_SECRET,
        redirect_uri: SALESFORCE_REDIRECT_URI,
        code,
      })
    );

    const { access_token, instance_url } = tokenResponse.data;
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
  const { salesforceToken, instanceUrl, accountName, firstName, lastName, email } = req.body;

  if (!salesforceToken || !instanceUrl) {
    return res.status(400).json({ error: "Missing authentication details" });
  }

  try {
    // Step 1: Create Account
    const accountResponse = await axios.post(
      `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Account/`,
      { Name: accountName },
      { headers: { Authorization: `Bearer ${salesforceToken}`, "Content-Type": "application/json" } }
    );

    const accountId = accountResponse.data.id;

    // Step 2: Create Contact linked to the Account
    const contactResponse = await axios.post(
      `${instanceUrl}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Contact/`,
      { FirstName: firstName, LastName: lastName, Email: email, AccountId: accountId },
      { headers: { Authorization: `Bearer ${salesforceToken}`, "Content-Type": "application/json" } }
    );

    res.json({ success: true, accountId, contactId: contactResponse.data.id });
  } catch (error) {
    console.error("Salesforce API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create Salesforce Account/Contact" });
  }
});

module.exports = router;
