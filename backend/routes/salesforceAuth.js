import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import base64url from "base64url";
import {
  getUserById,
  updateUserSalesforceToken,
} from "../services/salesforceService.js";
import jwt from "jsonwebtoken";

dotenv.config();
const router = express.Router();

function getUserIdFromToken(req) {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    return decoded.userId; // ✅ Return user ID from token payload
  } catch (error) {
    return null;
  }
}

function generateCodeVerifier() {
  return base64url(crypto.randomBytes(32));
}

function generateCodeChallenge(codeVerifier) {
  return base64url(crypto.createHash("sha256").update(codeVerifier).digest());
}

router.get("/", (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  const authUrl =
    `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/authorize
    ?response_type=code
    &client_id=${process.env.SALESFORCE_CONSUMER_KEY}
    &redirect_uri=${process.env.SALESFORCE_REDIRECT_URI}
    &state=${userId}` // 🔹 Store userId in `state` param
      .replace(/\s+/g, "");

  res.redirect(authUrl);
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;
  if (!code)
    return res.status(400).json({ error: "Authorization code is missing" });
  if (!state) return res.status(400).json({ error: "Missing user state" });

  try {
    // Exchange Authorization Code for Access Token
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
    const userId = state; // 🔹 Extracted from state param

    // ✅ Store Salesforce tokens in database
    await updateUserSalesforceToken(userId, access_token, instance_url);

    return res.json({
      message: "Salesforce authentication successful",
      access_token,
      instance_url,
    });
  } catch (error) {
    console.error(
      "🔴 Salesforce OAuth Error:",
      error.response?.data || error.message
    );
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
  const userId = getUserIdFromToken(req); // ✅ Extract user ID from JWT
  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  // Check if user has Salesforce access token
  const user = await getUserById(userId);
  if (!user || !user.salesforceAccessToken) {
    return res.status(403).json({ error: "User has not connected Salesforce" });
  }

  const { name, email, phone } = req.body;
  if (!name || !email)
    return res.status(400).json({ error: "Name and email are required" });

  try {
    const { salesforceAccessToken, salesforceInstanceUrl } = user;

    // ✅ Create Salesforce Account
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

    // ✅ Create Salesforce Contact (linked to Account)
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
    console.error(
      "🔴 Salesforce API Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      error: "Failed to create Salesforce Account",
      details: error.response?.data || error.message,
    });
  }
});

export default router;
