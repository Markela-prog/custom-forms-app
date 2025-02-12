import prisma from "../prisma/prismaClient.js";


export const checkTemplateAccess = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { accessControl: true, owner: true },
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (template.isPublic) {
      return next();
    }

    if (userId && (template.ownerId === userId || req.user.role === "ADMIN")) {
      return next();
    }

    const hasAccess = userId
      ? template.accessControl.some((access) => access.userId === userId)
      : false;

    if (!hasAccess) {
      return res.status(403).json({ message: "Unauthorized: No access to this template" });
    }

    next();
  } catch (error) {
    console.error("Access Control Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkFormAccess = async (req, res, next) => {
  try {
    const { formId } = req.params;
    const userId = req.user?.id;

    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: { user: true, template: { include: { accessControl: true } } },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (req.user.role === "ADMIN") {
      return next();
    }

    if (form.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized: You can only manage your own forms" });
    }

    if (!form.template.isPublic) {
      const hasAccess = form.template.accessControl.some(
        (access) => access.userId === userId
      );

      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized: No access to this template's form" });
      }
    }

    next();
  } catch (error) {
    console.error("Form Access Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkOwnerOrAdmin = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;

    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: { ownerId: true },
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    if (template.ownerId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized: Only OWNER or ADMIN can modify this template" });
    }

    next();
  } catch (error) {
    console.error("Ownership Check Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const preventDuplicateFormSubmission = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const userId = req.user?.id;

    const existingForm = await prisma.form.findFirst({
      where: { templateId, userId },
    });

    if (existingForm) {
      return res.status(400).json({ message: "You have already submitted this form" });
    }

    next();
  } catch (error) {
    console.error("Form Submission Check Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
