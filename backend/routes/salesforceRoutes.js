import express from "express";
import passport from "passport";
import {
  createSalesforceAccountAndContact,
  disconnectSalesforce,
} from "../services/salesforceService.js";
import { protect } from "../middleware/authMiddleware.js";
import cookie from "cookie";

const router = express.Router();

// 🔹 Salesforce OAuth Login
router.get(
  "/connect",
  (req, res, next) => {
    console.log("✅ [Salesforce] OAuth Login Initiated");
    console.log("🔹 [Session Before Login]:", req.session);
    next();
  },
  passport.authenticate("salesforce")
);

// 🔹 Salesforce OAuth Callback (Store Tokens in Session)
router.get(
  "/callback",
  passport.authenticate("salesforce", { session: true }),
  (req, res) => {
    if (!req.user || !req.user.accessToken) {
      console.error("🚨 [Salesforce Error]: No user or accessToken in session");
      return res
        .status(403)
        .json({ message: "Salesforce authentication failed" });
    }

    console.log("✅ [Salesforce] Authentication Successful");
    console.log("🔹 [Access Token]:", req.user.accessToken);

    // Store Salesforce tokens inside the session
    req.session.salesforceToken = req.user.accessToken;
    req.session.salesforceId = req.user.salesforceId;
    req.session.save(); // Ensure the session is saved

    res.redirect(`${process.env.FRONTEND_URL}/profile?connected=true`);
  }
);

// 🔹 Create Salesforce Account
router.post("/create-account", protect, async (req, res) => {
  try {
    const result = await createSalesforceAccountAndContact(req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Disconnect Salesforce (Clear Sessions)
router.post("/disconnect", protect, async (req, res) => {
  try {
    req.session.salesforceToken = null;
    req.session.salesforceId = null;
    req.session.save(); // Ensure session updates

    await disconnectSalesforce(req.user.id);
    res.json({ message: "Disconnected from Salesforce" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔹 Check Salesforce Connection Status
router.get("/status", protect, async (req, res) => {
  try {
    res.json({ connected: !!req.session.salesforceToken });
  } catch (error) {
    console.error("Error checking Salesforce status:", error);
    res.status(500).json({ message: "Failed to check Salesforce status" });
  }
});

export default router;
