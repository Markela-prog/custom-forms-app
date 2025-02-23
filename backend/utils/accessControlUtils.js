import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({
  resource,
  resourceId,
  user,
  action,
  templateId = null,
  questions = [],
  questionIds = [],
}) => {
  console.log(
    `[AccessControl] Checking access for User: ${
      user?.id || "Guest"
    } on ${resource} ${resourceId || "no-id"} (Action: ${action})`
  );

  let resourceData = null;
  let templateOwnerId = null;
  let accessControl = null;

  // SPECIAL CASE: Fetching Non-Admin Users
  if (resource === "template" && action === "manage_access" && !resourceId) {
    // Allow if user is ADMIN
    if (user?.role === "ADMIN") {
      console.log(`[AccessControl] ✅ Admin allowed to fetch non-admin users.`);
      return { access: true, role: "admin" };
    }

    // Allow if user is a Template Owner
    const ownedTemplates = await prisma.template.findMany({
      where: { ownerId: user?.id },
      select: { id: true },
    });

    if (ownedTemplates.length > 0) {
      console.log(`[AccessControl] ✅ User ${user.id} is a template owner.`);
      return { access: true, role: "owner" };
    }

    return {
      access: false,
      reason: "Only template owners or admins can fetch non-admin users",
    };
  }

  // SPECIAL CASE: Bypass access control for PUBLIC TEMPLATES (read only)
  if (resource === "template" && action === "read") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      select: { isPublic: true },
    });

    if (!template) {
      return { access: false, reason: "Template not found" };
    }

    // Allow guests to read public templates
    if (template.isPublic && !user) {
      return { access: true, role: "any" };
    }

    // Allow authenticated users to read public templates
    if (template.isPublic && user) {
      return { access: true, role: "authenticated" };
    }
  }

  // Bypass resource check for template creation (only requires authentication)
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

  // Allow fetching owned templates
  if (resource === "userTemplates" && action === "getUserTemplates") {
    if (user?.id === resourceId) {
      console.log(
        `[AccessControl] ✅ User ${user.id} accessing their templates.`
      );
      return { access: true, role: "authenticated" };
    }
    return { access: false, reason: "Unauthorized" };
  }

  // Special Handling for QUESTION Reorder
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

  // Handle QUESTION Create/Read
  if (resource === "question" && ["create", "read"].includes(action)) {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;

    // Owner Check
    if (user?.id === templateOwnerId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the OWNER.`);
      return { access: true, role: "owner" };
    }

    // Non-authenticated users (Guests) can read public template questions
    if (!user && template.isPublic) {
      console.log(
        `[AccessControl] ✅ Guest accessing public template questions.`
      );
      return { access: true, role: "any" };
    }

    // Authenticated users can read public template questions
    if (user && template.isPublic) {
      console.log(
        `[AccessControl] ✅ Authenticated user accessing public template questions.`
      );
      return { access: true, role: "authenticated" };
    }

    //ACL Check (for shared access)
    const isACL = template.accessControl?.some((ac) => ac.userId === user?.id);
    if (isACL) {
      console.log(`[AccessControl] ✅ User ${user?.id} has ACL access.`);
      return { access: true, role: "acl" };
    }

    return { access: false, reason: "Unauthorized" };
  }

  // Special Handling for Bulk QUESTION Update
  if (resource === "question" && action === "update") {
    const idsToCheck =
      action === "update" ? questions?.map((q) => q.id) || [] : questionIds;

    if (!Array.isArray(idsToCheck) || idsToCheck.length === 0) {
      return { access: false, reason: `No questions provided for ${action}` };
    }

    // Fetch all affected questions from DB
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { template: { select: { ownerId: true } } },
    });

    if (dbQuestions.length !== questionIds.length) {
      return { access: false, reason: "Some questions do not exist" };
    }

    // Ensure all questions belong to the same template
    const uniqueTemplateIds = [
      ...new Set(dbQuestions.map((q) => q.templateId)),
    ];
    if (uniqueTemplateIds.length > 1) {
      return {
        access: false,
        reason: "All questions must belong to the same template",
      };
    }

    const templateOwnerId = dbQuestions[0].template.ownerId;

    if (user?.role === "ADMIN") return { access: true, role: "admin" };

    if (user?.id === templateOwnerId) {
      return { access: true, role: "owner" };
    }

    return { access: false, reason: "Unauthorized to modify questions" };
  }

  // Special Handling for Bulk QUESTION Delete (Remains Unchanged)
  if (resource === "question" && action === "delete") {
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return {
        access: false,
        reason: "No questions provided for delete",
      };
    }

    // Fetch all affected questions from DB
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { template: { select: { ownerId: true } } },
    });

    if (dbQuestions.length !== questionIds.length) {
      return { access: false, reason: "Some questions do not exist" };
    }

    // Ensure all questions belong to the same template
    const uniqueTemplateIds = [
      ...new Set(dbQuestions.map((q) => q.templateId)),
    ];
    if (uniqueTemplateIds.length > 1) {
      return {
        access: false,
        reason: "All questions must belong to the same template",
      };
    }

    const templateOwnerId = dbQuestions[0].template.ownerId;

    if (user?.role === "ADMIN") return { access: true, role: "admin" };

    if (user?.id === templateOwnerId) {
      return { access: true, role: "owner" };
    }

    return { access: false, reason: "Unauthorized to delete questions" };
  }

  // Handle TEMPLATE Directly (for read/update/delete)
  if (resource === "template") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;
    accessControl = template.accessControl;

    // Guests can read public templates
    if (!user && template.isPublic) {
      console.log(`[AccessControl] ✅ Guest accessing public template.`);
      return { access: true, role: "any" };
    }
  }

  //Role-Based Access Logic
  if (user?.role === "ADMIN") {
    console.log(`[AccessControl] ✅ Admin Override`);
    return { access: true, role: "admin" };
  }

  if (templateOwnerId && templateOwnerId === user?.id) {
    console.log(`[AccessControl] ✅ User ${user?.id} is the OWNER`);
    return { access: true, role: "owner" };
  }

  // ACL Check
  const isACL = accessControl?.some((ac) => ac.userId === user?.id);
  if (isACL) {
    console.log(`[AccessControl] ✅ User ${user?.id} has ACL access.`);
    return { access: true, role: "acl" };
  }

  /** USER FORMS (Get User's Own Forms) **/
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

  /** TEMPLATE FORMS (Get Forms by Template) **/
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

  /** FORM **/
  if (resource === "form" && ["read", "delete"].includes(action)) {
    const form = await prisma.form.findUnique({
      where: { id: resourceId },
      include: { template: { select: { ownerId: true } } },
    });

    if (!form) {
      return { access: false, reason: "Form not found" };
    }

    resourceData = form;

    // Admins can view or delete any form
    if (user?.role === "ADMIN") {
      console.log(`[AccessControl] ✅ Admin accessing form ${resourceId}`);
      return { access: true, role: "admin" };
    }

    // Form owners can VIEW and DELETE their own forms
    if (user?.id === form.userId) {
      console.log(`[AccessControl] ✅ User ${user.id} is the form owner.`);
      return { access: true, role: "owner" };
    }

    // Template owners can ONLY VIEW forms related to their template
    if (user?.id === form.template.ownerId && action === "read") {
      console.log(
        `[AccessControl] ✅ User ${user.id} is the template owner, granting READ access.`
      );
      return { access: true, role: "template_owner" };
    }

    return {
      access: false,
      reason:
        action === "delete"
          ? "Only the form owner or admin can delete this form"
          : "Only the form owner, template owner, or admin can view this form",
    };
  }

  /** Handle Default Template and Question Logic **/

  // Handle TEMPLATE Directly (for read/update/delete)
  if (resource === "template") {
    const template = await prisma.template.findUnique({
      where: { id: resourceId },
      include: { owner: true, accessControl: true },
    });
    if (!template) return { access: false, reason: "Template not found" };

    resourceData = template;
    templateOwnerId = template.ownerId;

    // Guests can read public templates
    if (!user && template.isPublic) {
      console.log(`[AccessControl] ✅ Guest accessing public template.`);
      return { access: true, role: "any" };
    }
  }

  // Handle QUESTION Create/Read
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

  /** ANSWER (Update/Delete) **/
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

  /** FINAL FALLBACK (After All Checks) **/
  if (!resourceData) {
    console.error(`[AccessControl] ❌ Resource ${resource} not found.`);
    return { access: false, reason: `${resource} not found` };
  }

  console.log(`[AccessControl] ❌ User ${user?.id} Access Denied.`);
  return { access: false, reason: "Unauthorized" };
};
