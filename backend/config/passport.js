import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { handleOAuthLogin } from "../services/userService.js";
import dotenv from "dotenv";

dotenv.config();

const commonOAuthStrategyHandler =
  (provider) => async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`OAuth ${provider} Profile:`, profile);

      let email = profile.emails?.[0]?.value || null;

      // Fetch email manually if GitHub does not provide it
      if (!email && provider === "GITHUB") {
        console.log("Fetching email from GitHub API...");
        const response = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          console.error(
            `GitHub API email fetch failed: ${response.statusText}`
          );
          return done(new Error("No email found for GitHub"), null);
        }

        const emails = await response.json();
        email =
          emails.find((e) => e.primary && e.verified)?.email ||
          `${profile.username}@github.com`;
      }

      if (!email) {
        console.error(`OAuth Error: No email found for ${provider}`);
        return done(new Error(`No email found from ${provider}`), null);
      }

      // Pass the email & provider to login logic
      const user = await handleOAuthLogin(email, provider);
      return done(null, user);
    } catch (error) {
      console.error(`OAuth Error (${provider}):`, error);
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

passport.serializeUser((user, done) => {
  done(null, {
    id: user.id,
    email: user.email,
    authProvider: user.authProvider,
  });
});

passport.deserializeUser(async (userData, done) => {
  const user = await prisma.user.findUnique({ where: { id: userData.id } });

  if (user) {
    user.authProvider = userData.authProvider;
  }

  done(null, user);
});

export default passport;
