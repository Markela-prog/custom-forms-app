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
    } on ${resource} ${resourceId || "no-id"} (Action: ${action})`
  );

  // ✅ SPECIAL CASE: Bypass access control for PUBLIC TEMPLATES (read only)
  if (resource === "template" && action === "read") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      select: { isPublic: true },
    });
    if (template?.isPublic && !user) {
      console.log(`[AccessControl] ✅ Guest accessing public template.`);
      return { access: true, role: "any" };
    }
  }

  // ✅ Bypass resource check for template creation (only requires authentication)
  if (resource === "template" && action === "create") {
    if (user) {
      console.log("[AccessControl] ✅ Authenticated user creating template.");
      return { access: true, role: "authenticated" };
    } else {
      return {
        access: false,
        reason: "Only authenticated users can create templates",
      };
    }
  }

  let resourceData = null;
  let templateOwnerId = null;
  let accessControl = null;

  // 🟡 Special Handling for QUESTION Reorder
  if (resource === "question" && action === "reorder") {
    const targetTemplateId = templateId || questions[0]?.templateId;
    if (!targetTemplateId) {
      return { access: false, reason: "Template ID not found in request" };
    }

    const template = await prisma.template.findUnique({
      where: { id: targetTemplateId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;
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

    // 🟢 ✅ Owner Check
    if (user?.id === templateOwnerId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the OWNER.`);
      return { access: true, role: "owner" };
    }

    // 🟢 ✅ Non-authenticated users (Guests) can read public template questions
    if (!user && template.isPublic) {
      console.log(
        `[AccessControl] ✅ Guest accessing public template questions.`
      );
      return { access: true, role: "any" };
    }

    // 🟢 ✅ Authenticated users can read public template questions
    if (user && template.isPublic) {
      console.log(
        `[AccessControl] ✅ Authenticated user accessing public template questions.`
      );
      return { access: true, role: "authenticated" };
    }

    // 🟢 ✅ ACL Check (for shared access)
    const isACL = template.accessControl?.some((ac) => ac.userId === user?.id);
    if (isACL) {
      console.log(`[AccessControl] ✅ User ${user?.id} has ACL access.`);
      return { access: true, role: "acl" };
    }

    return { access: false, reason: "Unauthorized" };
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
    if (!question) return { access: false, reason: "Question not found" };

    resourceData = question.template;
    templateOwnerId = question.template.ownerId;
    accessControl = question.template.accessControl;
  }

  // 🟡 Handle TEMPLATE Directly (for read/update/delete)
  if (resource === "template") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;

    // 🟢 ✅ Guests can read public templates
    if (!user && template.isPublic) {
      console.log(`[AccessControl] ✅ Guest accessing public template.`);
      return { access: true, role: "any" };
    }
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

  // 🟡 GET FORMS BY TEMPLATE: Template ownership check
  if (resource === "templateForms" && action === "read") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      select: { ownerId: true },
    });

    if (!template) return { access: false, reason: "Template not found" };

    if (user?.id === template.ownerId) {
      return { access: true, role: "owner" };
    }
    if (user?.role === "ADMIN") {
      return { access: true, role: "admin" };
    }

    return {
      access: false,
      reason: "Only template owner or admin can access template forms",
    };
  }

  // 🟡 GET FORMS BY USER: User ownership check
  if (resource === "user" && action === "getUserForms") {
    if (user) {
      return { access: true, role: "authenticated" };
    }
    return {
      access: false,
      reason: "Only authenticated users can access their forms",
    };
  }

  // 🟡 GET FORM BY ID: Check form owner, template owner, or admin
  if (resource === "form" && ["read", "delete"].includes(action)) {
    const form = await prisma.form.findUnique({
      where: { id: resourceId },
      include: {
        template: {
          select: { ownerId: true },
        },
      },
    });
    if (!form) return { access: false, reason: "Form not found" };

    // ✅ Ownership Checks
    if (
      user?.id === form.userId || // User is Form Owner
      user?.id === form.template?.ownerId || // User is Template Owner
      user?.role === "ADMIN" // User is Admin
    ) {
      return { access: true, role: user?.role === "ADMIN" ? "admin" : "owner" };
    }

    return { access: false, reason: "Unauthorized to view this form" };
  }

  console.log(`[AccessControl] ❌ User ${user?.id} Access Denied.`);
  return { access: false, reason: "Unauthorized" };
};
