import bcrypt from "bcryptjs";
import prisma from "../prisma/prismaClient.js";
import { generateToken } from "../utils/tokenUtils.js";
import { handleError } from "../utils/errorHandler.js";

export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // ✅ If user exists but was created with OAuth, allow them to set a password
      if (!user.password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            authProvider: { push: "CREDENTIALS" },
          },
        });

        return res.status(200).json({ user, token: generateToken(user) });
      }

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

    if (!user.password) {
      return handleError(
        res,
        `This account was registered using OAuth (${user.authProvider.join(
          ", "
        )}). Please log in with OAuth.`,
        400
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return handleError(res, "Invalid credentials", 400);

    res.status(200).json({ user, token: generateToken(user) });
  } catch (error) {
    handleError(res, "Server error");
  }
};

export const socialLogin = async (req, res) => {
  try {
    if (!req.user) return handleError(res, "Authentication failed", 400);

    res.status(200).json({ user: req.user, token: generateToken(req.user) });
  } catch (error) {
    handleError(res, "Server error");
  }
};
