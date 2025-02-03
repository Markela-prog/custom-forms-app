import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  setPassword,
} from "../controllers/authController.js";
import { generateToken } from "../utils/tokenUtils.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/set-password", protect, setPassword);

router.get("/github", passport.authenticate("github"));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    if (!req.user) return handleError(res, "Authentication failed", 400);
    res.status(200).json({ user: req.user, token: generateToken(req.user) });
  }
);

export default router;
