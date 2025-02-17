import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient.js";
import { handleError } from "../utils/errorHandler.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  console.log("Received Token in Backend:", token); // Debugging

  if (!token) {
    return handleError(res, "No access token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

    console.log("Decoded Token:", decoded); // Debugging
    console.log("User Found in DB:", req.user); // Debugging

    if (!req.user) return handleError(res, "User not found", 404);

    next();
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    handleError(res, "Not authorized", 401);
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return handleError(res, "Admin access required", 403);
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!req.user) {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
};
