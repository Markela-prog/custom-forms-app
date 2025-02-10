import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  findUserByEmail,
  createUser,
  updateUser,
  updateUserById,
} from "../repositories/userRepository.js";
import { sendResetEmail } from "../utils/emailUtils.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const registerUser = async (email, password) => {
  let user = await findUserByEmail(email);

  if (user) {
    if (!user.password) throw new Error("Set a password via OAuth.");
    throw new Error("User already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  return createUser({
    email,
    password: hashedPassword,
    authProvider: ["CREDENTIALS"],
  });
};

export const loginUser = async (email, password) => {
  let user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials.");

  if (!user.password) throw new Error("Set a password via OAuth.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials.");

  return user;
};

export const handleOAuthLogin = async (email, provider) => {
  let user = await findUserByEmail(email);

  if (!user) {
    return createUser({ email, authProvider: [provider] });
  }

  if (!user.authProvider.includes(provider)) {
    await updateUser(email, { authProvider: { push: provider } });
  }

  return user;
};

export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  await updateUser(email, {
    resetToken: hashedToken,
    resetTokenExpiry: expiry,
  });
  await sendResetEmail(email, resetToken);
};

export const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: { resetTokenExpiry: { gte: new Date() } },
  });

  if (!user || !(await bcrypt.compare(token, user.resetToken))) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await updateUser(user.email, {
    password: hashedPassword,
    resetToken: null,
    resetTokenExpiry: null,
  });
};

export const setPassword = async (userId, password) => {
  let user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  if (user.password) throw new Error("Password is already set");

  const hashedPassword = await bcrypt.hash(password, 10);
  return updateUserById(userId, {
    password: hashedPassword,
    authProvider: { push: "CREDENTIALS" },
  });
};

export const logoutUser = async () => {
  return { message: "Logged out successfully" };
};

export const refreshToken = async (refreshToken) => {
  if (!refreshToken) throw new Error("No refresh token provided");

  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return reject(new Error("Invalid refresh token"));

        const user = await findUserById(decoded.id);
        if (!user) return reject(new Error("User not found"));

        resolve(generateAccessToken(user));
      }
    );
  });
};
