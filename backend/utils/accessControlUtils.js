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

  let resourceData = null;
  let templateOwnerId = null;
  let accessControl = null;

  // 🟡 Handle QUESTION Scopes via TEMPLATE Ownership
  if (resource === "question") {
    if (["create", "read", "reorder"].includes(action)) {
      resourceData = await prisma.template.findUnique({
        where: { id: resourceId },
        include: { accessControl: true },
      });
    }

    if (["update", "delete"].includes(action)) {
      const question = await prisma.question.findUnique({
        where: { id: resourceId },
        include: { template: { include: { accessControl: true } } },
      });
      if (!question) return { access: false, reason: "Question not found" };
      resourceData = question.template;
    }
  }

  // 🟡 Handle TEMPLATE Directly
  if (resource === "template") {
    resourceData = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { accessControl: true },
    });
  }

  if (!resourceData) {
    return { access: false, reason: `${resource} not found` };
  }

  templateOwnerId = resourceData.ownerId;
  accessControl = resourceData.accessControl;

  // 🟡 Role-Based Access Logic
  if (user?.role === "ADMIN") {
    console.log(`[AccessControl] Admin Override`);
    return { access: true, role: "admin" };
  }

  if (templateOwnerId === user?.id) {
    console.log(`[AccessControl] User ${user?.id} is the OWNER.`);
    return { access: true, role: "owner" };
  }

  // 🟢 ACL Check
  const isACL = accessControl?.some((ac) => ac.userId === user?.id);
  if (isACL) {
    console.log(`[AccessControl] User ${user?.id} has ACL access.`);
    return { access: true, role: "acl" };
  }

  // 🟢 Authenticated User Check (for public templates)
  if (user && resourceData.isPublic) {
    return { access: true, role: "authenticated" };
  }

  return { access: false, reason: "Unauthorized" };
};
