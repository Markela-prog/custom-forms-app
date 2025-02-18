// src/utils/resourcePolicyCheckers.js
import prisma from "../prisma/prismaClient.js";

/**
 * 🔹 TEMPLATE Policy
 */
export const templatePolicy = async ({ resourceId, user, action }) => {
  const template = await prisma.template.findUnique({
    where: { id: resourceId },
    include: { owner: true, accessControl: true },
  });

  if (!template) return { access: false, reason: "Template not found" };

  // 1️⃣ Admin Override
  if (user?.role === "ADMIN") return { access: true, role: "admin" };

  // 2️⃣ Owner Check
  if (template.ownerId === user?.id) {
    return { access: true, role: "owner" };
  }

  // 3️⃣ ACL Check
  const hasACL = template.accessControl.some((ac) => ac.userId === user?.id);
  if (hasACL) {
    return { access: true, role: "acl" };
  }

  // 4️⃣ Public Read Check
  if (action === "read" && template.isPublic) {
    return { access: true, role: "any" };
  }

  return { access: false, reason: "Unauthorized" };
};

/**
 * 🔹 QUESTION Policy
 * Relies on TEMPLATE Policy for access.
 */
export const questionPolicy = async ({ resourceId, user, action }) => {
  const question = await prisma.question.findUnique({
    where: { id: resourceId },
    include: {
      template: {
        include: { owner: true, accessControl: true },
      },
    },
  });

  if (!question) return { access: false, reason: "Question not found" };

  // Delegate to Template Policy
  return templatePolicy({
    resourceId: question.template.id,
    user,
    action,
  });
};

/**
 * 🔹 FORM Policy
 */
export const formPolicy = async ({ resourceId, user, action }) => {
  const form = await prisma.form.findUnique({
    where: { id: resourceId },
    include: {
      template: { include: { owner: true, accessControl: true } },
    },
  });

  if (!form) return { access: false, reason: "Form not found" };

  // Delegate to Template Policy
  return templatePolicy({
    resourceId: form.template.id,
    user,
    action,
  });
};

/**
 * 🔹 ANSWER Policy
 */
export const answerPolicy = async ({ resourceId, user, action }) => {
  const answer = await prisma.answer.findUnique({
    where: { id: resourceId },
    include: { form: { include: { template: true } } },
  });

  if (!answer) return { access: false, reason: "Answer not found" };

  // Delegate to Template Policy
  return templatePolicy({
    resourceId: answer.form.template.id,
    user,
    action,
  });
};
