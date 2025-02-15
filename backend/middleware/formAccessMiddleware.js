// src/middleware/formAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import prisma from "../prisma/prismaClient.js";

// ✅ Check Access for Form Operations
export const checkFormAccess = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const user = req.user;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { template: { include: { accessControl: true } } },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // ✅ Admin or Form Owner: Full Access
    if (user.role === "ADMIN" || form.userId === user.id) {
      return next();
    }

    // ✅ Check Template Access (Admin/Owner/Access Granted)
    const { access, reason } = await checkAccess({
      resource: "template",
      resourceId: form.template.id,
      user,
    });

    if (!access) {
      return res.status(403).json({ message: reason });
    }

    next();
  } catch (error) {
    console.error("Form Access Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

export const checkFormOrAnswerAccess = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const user = req.user;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { template: true },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // ✅ Full Access: Admin
    if (user.role === "ADMIN") {
      return next();
    }

    // ✅ Read-Only Access: Template Owner
    if (form.template.ownerId === user.id) {
      req.accessType = "READ_ONLY";
      return next();
    }

    // ✅ User: Only their own forms (Read-Only)
    if (form.userId === user.id) {
      req.accessType = "READ_ONLY";
      return next();
    }

    return res.status(403).json({
      message: "Unauthorized: Access to this form is not permitted",
    });
  } catch (error) {
    console.error("Access Check Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};