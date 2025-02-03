import bcrypt from "bcryptjs";
import prisma from "../prisma/prismaClient.js";
import { generateToken } from "../utils/tokenUtils.js";
import { handleError } from "../utils/errorHandler.js";
import { sendResetEmail } from "../utils/emailUtils.js";
import crypto from "crypto";

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (!user.password) return handleError(res, "Set a password via OAuth.", 400);
      return handleError(res, "User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: { email, password: hashedPassword, authProvider: ["CREDENTIALS"] },
    });

    res.status(201).json({ user, token: generateToken(user) });
  } catch (error) {
    handleError(res, "Server error");
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) return handleError(res, "Invalid credentials", 400);
    if (!user.password) return handleError(res, "Set a password via OAuth.", 400);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return handleError(res, "Invalid credentials", 400);

    res.status(200).json({ user, token: generateToken(user) });
  } catch (error) {
    handleError(res, "Server error");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return handleError(res, "User not found", 404);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const expiry = new Date(Date.now() + 3600000); // 1 hour expiration

    await prisma.user.update({
      where: { email },
      data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    await sendResetEmail(email, resetToken);

    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    handleError(res, "Server error");
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await prisma.user.findFirst({
      where: { resetTokenExpiry: { gte: new Date() } },
    });

    if (!user || !(await bcrypt.compare(token, user.resetToken))) {
      return handleError(res, "Invalid or expired token", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: user.email },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    handleError(res, "Server error");
  }
};
