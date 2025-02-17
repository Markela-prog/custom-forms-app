// src/utils/accessControlUtils.js
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

  let templateOwnerId = null;
  let accessControl = null;

  // 🟡 Handle QUESTION Scopes via TEMPLATE Ownership
  if (resource === "question") {
    if (["create", "read", "reorder"].includes(action)) {
      // 🟠 For CREATE, READ, REORDER -> Find Template by templateId
      const template = await prisma.template.findUnique({
        where: { id: resourceId },
        include: { accessControl: true },
      });
      if (!template) return { access: false, reason: "Template not found" };
      templateOwnerId = template.ownerId;
      accessControl = template.accessControl;
    }

    if (["update", "delete"].includes(action)) {
      // 🟠 For UPDATE, DELETE -> Find Template via Question
      const question = await prisma.question.findUnique({
        where: { id: resourceId },
        include: { template: { include: { accessControl: true } } },
      });
      if (!question) return { access: false, reason: "Question not found" };
      templateOwnerId = question.template.ownerId;
      accessControl = question.template.accessControl;
    }
  }

  // 🟡 Role-Based Access Logic
  if (user?.role === "ADMIN") {
    return { access: true, role: "admin" };
  }

  if (templateOwnerId === user?.id) {
    console.log(
      `[AccessControl] User ${user?.id} is the OWNER of the template.`
    );
    return { access: true, role: "owner" };
  }

  // 🟢 ACL Check
  const isACL = accessControl?.some((ac) => ac.userId === user?.id);
  if (isACL) {
    console.log(`[AccessControl] User ${user?.id} has ACL access.`);
    return { access: true, role: "acl" };
  }

  // 🟢 Public or Authenticated Check
  if (
    user &&
    resource === "template" &&
    action === "read" &&
    resourceData?.isPublic
  ) {
    return { access: true, role: "authenticated" };
  }

  return { access: false, reason: "Unauthorized" };
};
