// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  console.log(
    `[AccessControl] Checking access for User: ${
      user?.id || "Guest"
    } on ${resource} ${resourceId}`
  );

  let resourceData = null;
  let templateOwnerId = null;
  let accessControl = null;

  // 🟡 Handle QUESTION Scopes via TEMPLATE Ownership
  if (resource === "question") {
    if (["create", "read", "reorder"].includes(action)) {
      const template = await prisma.template.findUnique({
        where: { id: resourceId },
        include: {
          owner: true,
          accessControl: true,
        },
      });
      if (!template) return { access: false, reason: "Template not found" };

      // ✅ Allow `read` for public templates
      if (action === "read" && template.isPublic) {
        return { access: true, role: "any" };
      }

      resourceData = template;
      templateOwnerId = template.ownerId;
      accessControl = template.accessControl;

      console.log(
        `[AccessControl] QUESTION via TEMPLATE: Template Owner: ${templateOwnerId}, ACL Users: ${accessControl?.length}`
      );
    }

    if (["update", "delete"].includes(action)) {
      const question = await prisma.question.findUnique({
        where: { id: resourceId },
        include: {
          template: {
            include: {
              owner: true,
              accessControl: true,
            },
          },
        },
      });
      if (!question) return { access: false, reason: "Question not found" };

      resourceData = question.template;
      templateOwnerId = question.template.ownerId;
      accessControl = question.template.accessControl;

      console.log(
        `[AccessControl] QUESTION from TEMPLATE via QUESTION: Template Owner: ${templateOwnerId}, ACL Users: ${accessControl?.length}`
      );
    }
  }

  // 🟡 Handle TEMPLATE Directly
  if (resource === "template") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: {
        owner: true,
        accessControl: true,
      },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;

    console.log(
      `[AccessControl] TEMPLATE Direct: Owner: ${templateOwnerId}, ACL Users: ${accessControl?.length}`
    );
  }

  if (!resourceData) {
    console.error(`[AccessControl] Resource ${resource} not found.`);
    return { access: false, reason: `${resource} not found` };
  }

  // 🟡 Role-Based Access Logic
  if (user?.role === "ADMIN") {
    console.log(`[AccessControl] ✅ Admin Override`);
    return { access: true, role: "admin" };
  }

  if (templateOwnerId && templateOwnerId === user?.id) {
    console.log(`[AccessControl] ✅ User ${user?.id} is the OWNER`);
    return { access: true, role: "owner" };
  }

  // 🟢 ACL Check
  const isACL = accessControl?.some((ac) => ac.userId === user?.id);
  if (isACL) {
    console.log(`[AccessControl] ✅ User ${user?.id} has ACL access.`);
    return { access: true, role: "acl" };
  }

  // 🟢 Authenticated User Check (for public templates)
  if (user && resourceData.isPublic) {
    console.log(`[AccessControl] ✅ User ${user?.id} is AUTHENTICATED.`);
    return { access: true, role: "authenticated" };
  }

  console.log(`[AccessControl] ❌ User ${user?.id} Access Denied.`);
  return { access: false, reason: "Unauthorized" };
};
