import jwt from "jsonwebtoken";
import prisma from "../prisma/prismaClient.js";
import { handleError } from "../utils/errorHandler.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!req.user) return handleError(res, "User not found", 404);

      next();
    } catch (error) {
      handleError(res, "Not authorized", 401);
    }
  } else {
    handleError(res, "No token provided", 401);
  }
};
