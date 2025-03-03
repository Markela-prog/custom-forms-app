import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import prisma from "../prisma/prismaClient.js";

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
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Salesforce OAuth Error: ${error}`);

  const codeVerifier = req.session.codeVerifier;
  if (!codeVerifier) return res.status(400).send("Missing Code Verifier.");

  try {
    // Exchange Code for Access Token
    const tokenResponse = await axios.post(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: SALESFORCE_CONSUMER_KEY,
        client_secret: SALESFORCE_CONSUMER_SECRET,
        redirect_uri: SALESFORCE_REDIRECT_URI,
        code,
        code_verifier: codeVerifier,
      })
    );

    const { access_token, instance_url } = tokenResponse.data;

    // Retrieve the authenticated user (you need to adjust this logic)
    const userId = req.session.userId; // Assuming user ID is stored in session
    if (!userId) return res.status(401).send("User not authenticated.");

    // Save tokens to user table
    await prisma.user.update({
      where: { id: userId },
      data: {
        salesforceAccessToken: access_token,
        salesforceInstanceUrl: instance_url,
      },
    });

    // Redirect to profile (without tokens in query)
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
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
