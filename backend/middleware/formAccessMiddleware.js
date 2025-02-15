// src/middleware/formAccessMiddleware.js
import prisma from "../prisma/prismaClient.js";
import { checkResourceAccess } from "./resourceAccessMiddleware.js";

// ✅ Form Access: User (own form), Template Owner (template forms), Admin
export const checkFormAccess = async (req, res, next) => {
  const { formId } = req.params;
  const user = req.user;

  try {
    // 🟡 1️⃣ Fetch Form with Template Info
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { template: true },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // 🟠 2️⃣ Check for Direct Ownership: User owns the form
    if (form.userId === user.id) {
      return next();
    }

    // 🟠 3️⃣ Check for Template Ownership: User owns the template
    if (form.template.ownerId === user.id) {
      return next();
    }

    // 🟠 4️⃣ Check for Admin Privileges
    if (user.role === "ADMIN") {
      return next();
    }

    // 🚫 5️⃣ Deny Access Otherwise
    return res.status(403).json({
      message: "Unauthorized to access this form",
    });
  } catch (error) {
    console.error("Error checking form access:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const checkFormDeleteAccess = async (req, res, next) => {
  const user = req.user;

  // ✅ Admin Check
  if (user.role === "ADMIN") {
    return next();
  }

  // 🚫 Deny Access Otherwise
  return res.status(403).json({
    message: "Only admin can delete forms",
  });
};

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
