import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";
import prisma from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";

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

router.get("/login", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const token = req.headers.authorization?.split(" ")[1]; // Extract JWT

    if (!token) {
      return res.status(401).json({ message: "No access token provided" });
    }

    console.log("JWT Token in Backend:", token);

    // Generate PKCE challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    req.session.codeVerifier = codeVerifier;

    // Encode the user ID and JWT in state
    const state = encodeURIComponent(JSON.stringify({ userId, token }));
    console.log("Encoded State:", state);

    // Construct the Salesforce OAuth URL
    const authUrl = `${SALESFORCE_INSTANCE_URL}/services/oauth2/authorize?response_type=code&client_id=${SALESFORCE_CONSUMER_KEY}&redirect_uri=${encodeURIComponent(
      SALESFORCE_REDIRECT_URI
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=full&state=${state}`;

    // Instead of sending JSON, respond with a **redirect**
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error in Salesforce Login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/callback", async (req, res) => {
  const { code, state } = req.query;

  console.log("Received State from Salesforce:", state); // ✅ Debugging

  if (!state) return res.status(400).send("Missing state parameter.");

  // Decode state to extract userId and token
  try {
    const { userId, token } = JSON.parse(decodeURIComponent(state));

    console.log("Extracted JWT Token:", token); // ✅ Debugging

    // Verify the JWT access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded); // ✅ Debugging

    if (decoded.id !== userId) {
      return res
        .status(401)
        .json({ message: "Invalid token or user mismatch" });
    }

    const codeVerifier = req.session.codeVerifier;
    if (!codeVerifier) return res.status(400).send("Missing Code Verifier.");

    const tokenResponse = await axios.post(
      `${SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
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

    // Save Salesforce credentials in the user's database record
    await prisma.user.update({
      where: { id: userId },
      data: {
        salesforceAccessToken: access_token,
        salesforceInstanceUrl: instance_url,
      },
    });

    // Redirect back to frontend (WITHOUT exposing tokens in the URL)
    res.redirect(`${process.env.FRONTEND_URL}/profile`);
  } catch (error) {
    console.error("Error processing OAuth callback:", error);
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
