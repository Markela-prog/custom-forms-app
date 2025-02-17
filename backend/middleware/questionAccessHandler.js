// src/middleware/questionAccessHandler.js
import prisma from "../prisma/prismaClient.js";

/**
 * Custom Access Handler for Questions via Template ID
 * Handles all scenarios for question visibility based on template
 */
export const handleQuestionAccess = async ({ resourceId, user }) => {
  if (!resourceId) {
    return { access: false, reason: "Template ID is required" };
  }

  // ✅ Find Template Directly
  const template = await prisma.template.findUnique({
    where: { id: resourceId },
    include: { accessControl: true },
  });

  if (!template) {
    return { access: false, reason: "Template not found" };
  }

  // ✅ Admin Access (View All)
  if (user?.role === "ADMIN") {
    return { access: true };
  }

  // ✅ Owner Access
  if (template.ownerId === user?.id) {
    return { access: true };
  }

  // ✅ Authenticated Users with ACL Access
  if (user && template.accessControl?.some((ac) => ac.userId === user.id)) {
    return { access: true };
  }

  // ✅ Public Template (Allow non-auth users)
  if (template.isPublic) {
    return { access: true };
  }

  // 🚫 Default Deny
  return { access: false, reason: "No access to questions of this template" };
};
