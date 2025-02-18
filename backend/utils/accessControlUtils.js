// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({
  resource,
  resourceId,
  user,
  action,
  templateId = null,
  questions = [],
}) => {
  console.log(
    `[AccessControl] Checking access for User: ${
      user?.id || "Guest"
    } on ${resource} ${resourceId}`
  );

  let resourceData = null;
  let templateOwnerId = null;
  let accessControl = null;

  // 🟡 Special Handling for QUESTION Reorder
  if (resource === "question" && action === "reorder") {
    // ✅ Use `templateId` from arguments or fallback to first question
    const targetTemplateId = templateId || questions[0]?.templateId;

    if (!targetTemplateId) {
      return { access: false, reason: "Template ID not found in request" };
    }

    const template = await prisma.template.findUnique({
      where: { id: targetTemplateId },
      include: { owner: true, accessControl: true },
    });

    if (!template) {
      return { access: false, reason: "Template not found" };
    }

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;

    console.log(
      `[AccessControl] QUESTION REORDER via TEMPLATE: Template Owner: ${templateOwnerId}, ACL Users: ${accessControl?.length}`
    );
  }

  // 🟡 Handle QUESTION Create/Read
  if (resource === "question" && ["create", "read"].includes(action)) {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;
  }

  // 🟡 Handle QUESTION Update/Delete
  if (resource === "question" && ["update", "delete"].includes(action)) {
    const question = await prisma.question.findUnique({
      where: { id: resourceId },
      include: {
        template: {
          include: { owner: true, accessControl: true },
        },
      },
    });
    if (!question) {
      return { access: false, reason: "Question not found" };
    }

    resourceData = question.template;
    templateOwnerId = question.template.ownerId;
    accessControl = question.template.accessControl;
  }

  // 🟡 Handle TEMPLATE Directly
  if (resource === "template") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) {
      return { access: false, reason: "Template not found" };
    }

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;
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
