// src/middleware/questionAccessHandler.js
import { checkAccess } from "../utils/accessControlUtils.js";
import prisma from "../prisma/prismaClient.js";

/**
 * Custom Access Handler for Questions:
 * - Uses `templateId` for access check (not questionId)
 */
export const handleQuestionAccess = async ({ user, resourceId, accessLevel }) => {
  // ✅ 1️⃣ Find Template by Template ID
  const template = await prisma.template.findUnique({
    where: { id: resourceId },
    include: { accessControl: true },
  });

  if (!template) {
    return { access: false, reason: "Template not found" };
  }

  // ✅ 2️⃣ Admin Override
  if (user?.role === "ADMIN") {
    return { access: true };
  }

  // ✅ 3️⃣ Template Owner Override
  if (template.ownerId === user?.id) {
    return { access: true };
  }

  // ✅ 4️⃣ ACL Check (Read Access for Users with Template Access)
  if (
    user &&
    template.accessControl?.some((ac) => ac.userId === user.id)
  ) {
    return { access: true };
  }

  // 🚫 Default: No Access
  return { access: false, reason: "Unauthorized to view questions for this template" };
};
