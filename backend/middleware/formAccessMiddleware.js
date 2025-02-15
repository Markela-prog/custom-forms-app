// src/middleware/formAccessMiddleware.js
import prisma from "../prisma/prismaClient.js";
import { checkResourceAccess } from "./resourceAccessMiddleware.js";

// ✅ Form Access: User (own form), Template Owner (template forms), Admin
export const checkFormAccess = checkResourceAccess("form", "read");

// ✅ Admin Only for Deletion
export const checkFormAdminAccess = checkResourceAccess("form", "admin");

// ✅ Prevent Duplicate Form Submission
export const preventDuplicateFormSubmission = async (req, res, next) => {
  const { templateId } = req.params;
  const userId = req.user?.id;

  const existingForm = await prisma.form.findFirst({
    where: { templateId, userId },
  });

  if (existingForm) {
    return res.status(400).json({ message: "You have already submitted this form" });
  }

  next();
};
