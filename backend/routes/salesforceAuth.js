import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import {
  getUserById,
  updateUserSalesforceToken,
} from "../services/salesforceService.js";

dotenv.config();
const router = express.Router();

router.get("/", (req, res) => {
  const authUrl = `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/authorize?response_type=code&client_id=${process.env.SALESFORCE_CONSUMER_KEY}&redirect_uri=${process.env.SALESFORCE_REDIRECT_URI}`;
  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query;
  if (!code)
    return res.status(400).json({ error: "Authorization code is missing" });

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

    const { access_token, instance_url } = response.data;

    // Get the authenticated user from session
    const userId = req.session.userId;
    if (!userId)
      return res.status(401).json({ error: "User not authenticated" });

    // ✅ Store Salesforce tokens in the database
    await updateUserSalesforceToken(userId, access_token, instance_url);

    return res.json({
      message: "Salesforce authentication successful",
      access_token,
      instance_url,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to exchange authorization code",
      details: error.response?.data || error.message,
    });
  }
});

router.get("/session", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  const user = await getUserById(userId);
  if (!user || !user.salesforceAccessToken) {
    return res
      .status(401)
      .json({ error: "User not authenticated with Salesforce" });
  }

  return res.json({
    salesforceConnected: true,
    instanceUrl: user.salesforceInstanceUrl,
  });
});

router.post("/create-account", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  const user = await getUserById(userId);
  if (!user || !user.salesforceAccessToken) {
    return res
      .status(401)
      .json({ error: "User not authenticated with Salesforce" });
  }

  const { name, email, phone } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "Name and email are required" });

  try {
    const { salesforceAccessToken, salesforceInstanceUrl } = user;

    // Create Salesforce Account
    const accountResponse = await axios.post(
      `${salesforceInstanceUrl}/services/data/v63.0/sobjects/Account`,
      { Name: name },
      {
        headers: {
          Authorization: `Bearer ${salesforceAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const accountId = accountResponse.data.id;

    // Create Salesforce Contact (linked to Account)
    const contactResponse = await axios.post(
      `${salesforceInstanceUrl}/services/data/v63.0/sobjects/Contact`,
      { LastName: name, Email: email, Phone: phone, AccountId: accountId },
      {
        headers: {
          Authorization: `Bearer ${salesforceAccessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({
      message: "Salesforce Account & Contact created successfully",
      accountId,
      contactId: contactResponse.data.id,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to create Salesforce Account",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
