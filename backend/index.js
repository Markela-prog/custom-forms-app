import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import passport from "./config/passport.js";
import templateRoutes from "./routes/templateRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import formRoutes from "./routes/formRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import templateAccessRoutes from "./routes/templateAccessRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import salesforceRoutes from "./routes/salesforceRoutes.js";
import cookieParser from "cookie-parser";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(cookieParser());

app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000, // ✅ Check expired sessions every 2 min
      dbRecordIdIsSessionId: true, // ✅ Store session ID as primary key
    }),
    secret: process.env.SESSION_SECRET || "super_secure_secret",
    resave: false,
    saveUninitialized: false, // ✅ Prevent empty sessions
    proxy: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // ✅ 24-hour expiration
    },
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/template-access", templateAccessRoutes);
app.use("/api/likes", likeRoutes);

app.use("/api/salesforce", salesforceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
