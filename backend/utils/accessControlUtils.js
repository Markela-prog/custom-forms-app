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

  let resourceData = null;
  let templateOwnerId = null;
  let accessControl = null;
  let accessRole = "undefined";

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

  /** 🟡 1) USER FORMS (Get User's Own Forms) **/
  if (resource === "userForms" && action === "getUserForms") {
    if (user?.id === resourceId) {
      console.log(
        `[AccessControl] ✅ User ${user.id} accessing their own forms.`
      );
      return { access: true, role: "authenticated" };
    }
    return {
      access: false,
      reason: "Only the form owner can access their own forms",
    };
  }

  /** 🟡 2) TEMPLATE FORMS (Get Forms by Template) **/
  if (resource === "templateForms" && action === "read") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      select: { ownerId: true },
    });

    if (!template) {
      return { access: false, reason: "Template not found" };
    }

    if (user?.id === template.ownerId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the template owner.`);
      return { access: true, role: "owner" };
    }

    if (user?.role === "ADMIN") {
      console.log(`[AccessControl] ✅ Admin accessing template forms.`);
      return { access: true, role: "admin" };
    }

    return {
      access: false,
      reason:
        "Only the template owner or admin can access these template forms",
    };
  }

  /** 🟡 3) FORM (Get a Single Form) **/
  if (resource === "form" && action === "read") {
    const form = await prisma.form.findUnique({
      where: { id: resourceId },
      include: {
        template: {
          select: { ownerId: true },
        },
      },
    });

    if (!form) {
      return { access: false, reason: "Form not found" };
    }

    if (user?.id === form.userId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the form owner.`);
      return { access: true, role: "owner" };
    }

    if (user?.id === form.template?.ownerId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the template owner.`);
      return { access: true, role: "template_owner" };
    }

    if (user?.role === "ADMIN") {
      console.log(`[AccessControl] ✅ Admin accessing form.`);
      return { access: true, role: "admin" };
    }

    return {
      access: false,
      reason:
        "Only the form owner, template owner, or admin can access this form",
    };
  }

  /** ✅ THEN: Handle Default Template and Question Logic **/

  // 🟡 Handle TEMPLATE Directly (for read/update/delete)
  if (resource === "template") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;

    // 🟢 ✅ Guests can read public templates
    if (!user && template.isPublic) {
      console.log(`[AccessControl] ✅ Guest accessing public template.`);
      return { access: true, role: "any" };
    }
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

    if (user?.id === templateOwnerId) {
      return { access: true, role: "owner" };
    }
  }

  /** 🟡 ANSWER (Update/Delete) **/
  // Only Form Owner or Admin can update/delete answers
  if (resource === "answer" && ["update", "delete"].includes(action)) {
    const form = await prisma.form.findUnique({
      where: { id: resourceId },
      select: { userId: true },
    });

    if (!form) {
      return { access: false, reason: "Form not found" };
    }

    if (user?.id === form.userId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the form owner.`);
      return { access: true, role: "owner" };
    }

    if (user?.role === "ADMIN") {
      console.log(
        `[AccessControl] ✅ Admin overriding for answer modification.`
      );
      return { access: true, role: "admin" };
    }

    return {
      access: false,
      reason: "Only the form owner or admin can modify answers",
    };
  }

  /** 🛑 FINAL FALLBACK (After All Checks) **/
  if (!resourceData) {
    console.error(`[AccessControl] ❌ Resource ${resource} not found.`);
    return { access: false, reason: `${resource} not found` };
  }

  console.log(`[AccessControl] ❌ User ${user?.id} Access Denied.`);
  return { access: false, reason: "Unauthorized" };
};
