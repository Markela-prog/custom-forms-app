import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  socialLogin,
  setPassword,
} from "../controllers/authController.js";
import { generateToken } from "../utils/tokenUtils.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/set-password", protect, setPassword);


//router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
//router.get("/google/callback", passport.authenticate("google"), socialLogin);

router.get("/github", passport.authenticate("github"));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    try {
      if (!req.user) {
        console.error("GitHub Callback: User Not Found!");
        return handleError(res, "Authentication failed", 400);
      }

      console.log("GitHub Callback: User Authenticated:", req.user);

      const token = generateToken(req.user);
      res.status(200).json({ user: req.user, token });
    } catch (error) {
      console.error("GitHub Callback Error:", error);
      handleError(res, "Server error");
    }
  }
);

export default router;
