import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { handleOAuthLogin } from "../services/userService.js";
import dotenv from "dotenv";
import fetch from "node-fetch"; // Ensure fetch is available

dotenv.config();

const commonOAuthStrategyHandler =
  (provider) => async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`OAuth ${provider} Profile:`, profile);

      let email =
        profile.emails?.[0]?.value || (provider === "GITHUB" ? null : `${profile.username}@github.com`);

      if (!email) {
        console.error(`OAuth Error: No email found for ${provider} profile`, profile);
        return done(new Error(`No email found from ${provider}`), null);
      }

      const user = await handleOAuthLogin(email, provider);
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  };

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    commonOAuthStrategyHandler("GOOGLE")
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    commonOAuthStrategyHandler("GITHUB")
  )
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  done(null, id);
});

export default passport;
