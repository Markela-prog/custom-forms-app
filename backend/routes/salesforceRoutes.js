import express from "express";
import axios from "axios";
import passport from "passport";
import { protect } from "../middleware/authMiddleware.js";
import {
  createSalesforceAccountAndContact,
  disconnectSalesforce,
} from "../services/salesforceService.js";
import { generatePkce } from "../utils/pkceUtils.js";
import prisma from "../prisma/prismaClient.js";
import { encrypt, decrypt } from "../utils/encryptionUtils.js";

const router = express.Router();

/**
 * ✅ Step 1: Start OAuth Flow (Salesforce Login)
 */
router.get("/connect", protect, async (req, res) => {
  try {
    const pkce = await generatePkce();

    // ✅ Store PKCE values in session (PostgreSQL)
    req.session.code_verifier = pkce.code_verifier;
    req.session.code_challenge = pkce.code_challenge;

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("🚨 [Salesforce Error] Session Save Failed:", err);
          return reject(err);
        }
        resolve();
      });
    });

    console.log("✅ [Salesforce] Session Before Redirect:", req.session);

    const encryptedState = encrypt(req.user.id);

    // ✅ Construct Salesforce Auth URL
    const authUrl = `${
      process.env.SALESFORCE_INSTANCE_URL
    }/services/oauth2/authorize?response_type=code&client_id=${
      process.env.SALESFORCE_CONSUMER_KEY
    }&redirect_uri=${
      process.env.SALESFORCE_REDIRECT_URI
    }&state=${encodeURIComponent(encryptedState)}&code_challenge=${
      pkce.code_challenge
    }&code_challenge_method=S256`;

    console.log("✅ [Salesforce] Redirecting to:", authUrl);
    res.json({ authUrl });
  } catch (error) {
    console.error("🚨 [PKCE Generation Error]:", error);
    return res.status(500).json({ message: "PKCE generation failed" });
  }
});

router.get("/callback", async (req, res) => {
  console.log("✅ [Salesforce] Callback Hit");
  console.log("🔹 [Query Params]:", req.query);

  if (!req.query.code) {
    console.error("🚨 [Salesforce Error]: No `code` received");
    return res
      .status(400)
      .json({ message: "Salesforce OAuth failed: No code received" });
  }

  const userId = decrypt(decodeURIComponent(req.query.state));

  // ✅ Explicitly Fetch Session from Database (Ensures Persistence)
  await new Promise((resolve, reject) => {
    req.session.reload((err) => {
      if (err) {
        console.error("🚨 [Session Error] Could not reload session:", err);
        return reject(err);
      }
      resolve();
    });
  });

  console.log("✅ [Salesforce] Session Before Token Exchange:", req.session);

  // ✅ Retrieve PKCE code_verifier from session
  const codeVerifier = req.session.code_verifier;
  if (!codeVerifier) {
    console.error("🚨 [Salesforce Error]: Missing `code_verifier` in session");
    return res.status(400).json({ message: "Missing PKCE code verifier" });
  }

  try {
    // ✅ Exchange Authorization Code for Access Token
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

    // ✅ Store Salesforce Tokens in User DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        salesforceAccessToken: tokenResponse.access_token,
        salesforceRefreshToken: tokenResponse.refresh_token,
        salesforceInstanceUrl: process.env.SALESFORCE_INSTANCE_URL,
        salesforceConnectedAt: new Date(),
      },
    });

    req.session.destroy();

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

router.post("/create-account", protect, async (req, res) => {
  try {
    if (!req.user.salesforceAccessToken) {
      return res.status(400).json({ message: "Salesforce not connected." });
    }

    const result = await createSalesforceAccountAndContact(req.user, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/status", protect, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { salesforceAccessToken: true, salesforceAccountId: true },
  });

  if (!user || !user.salesforceAccessToken) {
    return res.json({ connected: false, hasAccount: false });
  }

  // Validate if the token is still valid
  try {
    await axios.get(
      `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v${process.env.SALESFORCE_API_VERSION}/sobjects/Account`,
      {
        headers: { Authorization: `Bearer ${user.salesforceAccessToken}` },
      }
    );
  } catch (error) {
    return res.json({ connected: false, hasAccount: false });
  }

  res.json({ connected: true, hasAccount: !!user.salesforceAccountId });
});

router.post("/disconnect", protect, async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        salesforceAccessToken: null,
        salesforceRefreshToken: null,
        salesforceInstanceUrl: null,
      },
    });

    res.json({ message: "Disconnected from Salesforce" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
