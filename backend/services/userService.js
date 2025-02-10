import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateUserById,
  findUserByResetToken,
} from "../repositories/userRepository.js";
import { sendResetEmail } from "../utils/emailUtils.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService.js";

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

  return {
    user,
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

export const forgotPassword = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("User not found");

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, 10);
  const expiry = new Date(Date.now() + 3600000 * 4);

  await updateUser(email, {
    resetToken: hashedToken,
    resetTokenExpiry: expiry,
  });
  await sendResetEmail(email, resetToken);
};

export const resetPassword = async (token, newPassword) => {
  if (!token) {
    throw new Error("No reset token provided.");
  }

  const user = await findUserByResetToken();

  if (!user) {
    throw new Error("Invalid or expired token - No matching user found.");
  }

  if (!user.resetToken) {
    throw new Error("Reset token not set.");
  }

  const isValidToken = await bcrypt.compare(token, user.resetToken);

  if (!isValidToken) {
    throw new Error("Invalid or expired token - Token mismatch.");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update user with new password
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
  if (!refreshToken) throw new Error("No refresh token provided.");

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) throw new Error("Invalid or expired refresh token.");

  const user = await findUserById(decoded.id);
  if (!user) throw new Error("User not found.");

  return generateAccessToken(user);
};

export const handleOAuthTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

export const handleOAuthLogin = async (email, provider) => {
  if (!email) {
    throw new Error("OAuth login failed: Email is undefined.");
  }

  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUser({ email, authProvider: [provider] });
  } else {
    const updatedAuthProviders = Array.isArray(user.authProvider)
      ? [...new Set([...user.authProvider, provider])]
      : [provider];

    await updateUser(email, { authProvider: updatedAuthProviders });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { user, accessToken, refreshToken };
};
