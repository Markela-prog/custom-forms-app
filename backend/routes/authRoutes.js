import express from "express";
import passport from "passport";
import {
  register,
  login,
  forgotPasswordController,
  resetPasswordController,
  setPasswordController,
  logout,
  refreshToken,
  oauthCallback,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/set-password", protect, setPasswordController);
router.post("/refresh-token", refreshToken);

// OAuth routes (Google & GitHub)
router.get("/google", passport.authenticate("google"));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  oauthCallback
);
router.get("/github", passport.authenticate("github"));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  oauthCallback
);

export default router;
