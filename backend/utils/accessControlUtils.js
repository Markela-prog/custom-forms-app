// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  if (!resourceId) {
    if (["create", "read_all", "getUserForms"].includes(action)) {
      return user
        ? { access: true, role: "authenticated" }
        : { access: false, reason: "Unauthorized" };
    }
    return { access: false, reason: "Resource ID is required" };
  }

  console.log(
    `[AccessControl] User ${
      user?.id || "Guest"
    } attempting ${action} on ${resource} ${resourceId}`
  );

  // 🟡 Handle QUESTION Scopes via TEMPLATE Ownership
  if (resource === "question") {
    let templateOwnerId = null;

    // 🟠 1️⃣ For CREATE, READ, REORDER -> Use templateId
    if (action === "create" || action === "read" || action === "reorder") {
      const template = await prisma.template.findUnique({
        where: { id: resourceId },
        select: { ownerId: true },
      });
      if (!template) return { access: false, reason: "Template not found" };
      templateOwnerId = template.ownerId;
    }

    // 🟠 2️⃣ For UPDATE, DELETE -> Find Template via Question
    if (action === "update" || action === "delete") {
      const question = await prisma.question.findUnique({
        where: { id: resourceId },
        include: { template: { select: { ownerId: true } } },
      });
      if (!question) return { access: false, reason: "Question not found" };
      templateOwnerId = question.template?.ownerId;
    }

    // 🟢 Role-Based Checks
    if (user?.role === "ADMIN") return { access: true, role: "admin" };
    if (templateOwnerId === user?.id) return { access: true, role: "owner" };

    return {
      access: false,
      reason: "Only template owners can manage questions",
    };
  }

  // 🟠 Default Resource Check (e.g., Template Access)
  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include: { accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  // 🟢 Role-Based Access
  if (user?.role === "ADMIN") return { access: true, role: "admin" };
  if (resourceData.ownerId === user?.id) return { access: true, role: "owner" };

  // ✅ ACL Check
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return { access: true, role: "acl" };
  }

  // ✅ Authenticated for Public Resources
  if (user && resourceData.isPublic) {
    return { access: true, role: "authenticated" };
  }

  return { access: false, reason: "Unauthorized" };
};
