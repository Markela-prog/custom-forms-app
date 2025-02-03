import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/github", passport.authenticate("github"));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        console.error("❌ GitHub Callback Error: No User Found");
        return handleError(res, "Authentication failed", 400);
      }

      console.log("✅ GitHub Callback Success:", req.user);

      // 🔹 Generate JWT Token
      const token = generateToken(req.user);

      // 🔹 Send JSON response
      return res.status(200).json({ user: req.user, token });
    } catch (error) {
      console.error("❌ GitHub Callback Processing Error:", error);
      handleError(res, "Server error");
    }
  }
);

export default router;
