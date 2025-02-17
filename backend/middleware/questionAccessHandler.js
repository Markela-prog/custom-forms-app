// src/middleware/questionAccessHandler.js
import prisma from "../prisma/prismaClient.js";

/**
 * Custom Access Handler for Questions via Template ID
 * - For GET (Questions): Use `templateId` directly
 */
export const handleQuestionAccess = async ({ resourceId, user }) => {
  // ✅ Find Template Directly
  const template = await prisma.template.findUnique({
    where: { id: resourceId },
    include: { accessControl: true },
  });

  if (!template) {
    return { access: false, reason: "Template not found" };
  }

  // ✅ Admin Access
  if (user?.role === "ADMIN") {
    return { access: true };
  }

  // ✅ Template Owner Access
  if (template.ownerId === user?.id) {
    return { access: true };
  }

  // ✅ ACL Access for Auth Users
  if (user && template.accessControl?.some((ac) => ac.userId === user.id)) {
    return { access: true };
  }

  // 🚫 Default Deny
  return { access: false, reason: "No access to questions of this template" };
};
