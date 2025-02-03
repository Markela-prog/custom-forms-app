import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import prisma from "../prisma/prismaClient.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // ✅ If user exists, update authProvider (if needed)
          if (user.authProvider !== "GOOGLE") {
            user = await prisma.user.update({
              where: { email },
              data: { authProvider: "GOOGLE" },
            });
          }
        } else {
          // ✅ If no user exists, create a new one
          user = await prisma.user.create({
            data: { email, authProvider: "GOOGLE" },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
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
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`;

        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // ✅ If user exists, add GitHub to authProvider array (if not already present)
          if (!user.authProvider.includes("GITHUB")) {
            user = await prisma.user.update({
              where: { email },
              data: { authProvider: { push: "GITHUB" } },
            });
          }
        } else {
          // ✅ If no user exists, create a new one
          user = await prisma.user.create({
            data: { email, authProvider: ["GITHUB"] },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } });
  done(null, user);
});

export default passport;
