import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient.js";
import { handleError } from "../utils/errorHandler.js";

export const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return handleError(res, "No access token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!req.user) return handleError(res, "User not found", 404);

    next();
  } catch (error) {
    handleError(res, "Not authorized", 401);
  }
};
