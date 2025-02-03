import express from "express";
import passport from "passport";
import { registerUser, loginUser, socialLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google"), socialLogin);

router.get("/github", passport.authenticate("github"));
router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/api/auth/failure" }),
    (req, res) => {
      // Send user data as JSON instead of redirecting
      /*res.json({
        success: true,
        message: "GitHub authentication successful",
        user: req.user,
        */
       res.send('hello');
      
    }
  );
  

export default router;
