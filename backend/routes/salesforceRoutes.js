import express from "express";
import passport from "passport";
import {
  createSalesforceAccountAndContact,
  disconnectSalesforce,
} from "../services/salesforceService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Salesforce OAuth Login
router.get("/connect", passport.authenticate("salesforce"));

// Salesforce OAuth Callback
router.get(
  "/callback",
  passport.authenticate("salesforce", { session: true }),
  (req, res) => {
    if (!req.user) {
      console.error("🚨 Salesforce authentication failed: No user in session");
      return res
        .status(403)
        .json({ message: "Salesforce authentication failed" });
    }

    console.log("✅ Salesforce User Authenticated:", req.user);
    res.redirect(`${process.env.FRONTEND_URL}/profile?connected=true`);
  }
);

// Create Salesforce Account
router.post("/create-account", protect, async (req, res) => {
  try {
    const result = await createSalesforceAccountAndContact(req.user);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Disconnect Salesforce
router.post("/disconnect", protect, async (req, res) => {
  try {
    await disconnectSalesforce(req.user.id);
    res.json({ message: "Disconnected from Salesforce" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if the user is connected to Salesforce
router.get("/status", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { salesforceId: true },
    });

    res.json({ connected: !!user.salesforceId });
  } catch (error) {
    console.error("Error checking Salesforce status:", error);
    res.status(500).json({ message: "Failed to check Salesforce status" });
  }
});

export default router;
