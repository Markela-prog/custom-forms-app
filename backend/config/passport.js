import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { handleOAuthLogin } from "../services/authService.js";
import dotenv from "dotenv";
import { storeSalesforceTokens } from "../services/salesforceService.js";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import pkceChallenge from "pkce-challenge";

dotenv.config();

const commonOAuthStrategyHandler =
  (provider) => async (accessToken, refreshToken, profile, done) => {
    try {
      console.log(`OAuth ${provider} Profile:`, profile);

      let email = profile.emails?.[0]?.value || null;

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

      const user = await handleOAuthLogin(email, provider, profile);

      return done(null, {
        id: user.user.id,
        email: user.user.email,
        authProvider: user.user.authProvider,
      });
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

// Generate PKCE challenge and verifier
const pkce = pkceChallenge();
const CODE_VERIFIER = pkce.code_verifier;
const CODE_CHALLENGE = pkce.code_challenge;

passport.use(
  "salesforce",
  new OAuth2Strategy(
    {
      authorizationURL: `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/authorize`,
      tokenURL: `${process.env.SALESFORCE_INSTANCE_URL}/services/oauth2/token`,
      clientID: process.env.SALESFORCE_CONSUMER_KEY,
      clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
      callbackURL: process.env.SALESFORCE_REDIRECT_URI,
      scope: ["api", "refresh_token", "id"],
      state: true, // Enable state validation
      pkce: true, // Enable PKCE
    },
    async (accessToken, refreshToken, params, profile, done) => {
      try {
        const instanceUrl = params.instance_url;

        // Fetch Salesforce user details
        const userInfo = await axios.get(
          `${instanceUrl}/services/oauth2/userinfo`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        const salesforceUser = userInfo.data;
        console.log("✅ Salesforce User Info:", salesforceUser);

        // Store tokens and Salesforce user details in DB
        await storeSalesforceTokens({
          userId: profile.id, // Use user ID from session
          salesforceId: salesforceUser.user_id,
          accessToken,
          refreshToken,
          instanceUrl,
        });

        return done(null, {
          id: profile.id,
          salesforceId: salesforceUser.user_id,
        });
      } catch (error) {
        console.error("❌ Salesforce OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

// Inject PKCE challenge parameters dynamically
passport.authenticate("salesforce", {
  session: false,
  state: true, // Ensures state validation
  codeChallenge: CODE_CHALLENGE, // Add PKCE challenge
  codeChallengeMethod: "S256", // Use SHA256 hashing for PKCE
});

export default passport;
