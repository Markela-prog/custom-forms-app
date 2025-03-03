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

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(passport.initialize());

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

app.use(passport.session());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "cSzPG8WUW63xoHsLNNC9JIkgHHai9Ohq", // 🔹 Secure with ENV
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" }, // Use secure cookies in production
  })
);

app.use("/api/salesforce", salesforceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
