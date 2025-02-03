import express from "express";
import passport from "passport";
import { registerUser, loginUser, socialLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

//router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
//router.get("/google/callback", passport.authenticate("google"), socialLogin);

router.get("/github", passport.authenticate("github"));
router.get("/github/callback", (req, res) => {
    console.log("GitHub callback triggered:", req.originalUrl);
    res.send("GitHub callback received.");
});


export default router;
