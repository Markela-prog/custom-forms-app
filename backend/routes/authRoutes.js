import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  socialLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

//router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
//router.get("/google/callback", passport.authenticate("google"), socialLogin);

router.get("/github", passport.authenticate("github"));
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    if (!req.user) return handleError(res, "Authentication failed", 400);

    const token = generateToken(req.user);
    res.status(200).json({ user: req.user, token });
  }
);

export default router;
