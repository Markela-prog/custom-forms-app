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

// 🔹 Salesforce OAuth Callback (Store Token in Cookie)
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

    // Store the token securely in an HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("salesforceToken", req.user.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })
    );

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

// 🔹 Disconnect Salesforce (Clear Cookies)
router.post("/disconnect", protect, async (req, res) => {
  try {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("salesforceToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(0),
        path: "/",
      })
    );

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
