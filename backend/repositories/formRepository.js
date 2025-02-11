import prisma from "../prisma/prismaClient.js";

export const checkTemplateAccess = async (templateId, userId) => {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: { accessControl: true },
  });

  if (!template) throw new Error("Template not found");

  // If public, allow any authenticated user
  if (template.isPublic) return true;

  // If private, only allow owner or explicitly added users
  const hasAccess = template.accessControl.some(
    (access) => access.userId === userId
  );
  if (!hasAccess) throw new Error("Unauthorized: No access to this template");

  return true;
};

export const createForm = async (templateId, userId, emailCopyRequested) => {
  await checkTemplateAccess(templateId, userId);

  return prisma.form.create({
    data: { templateId, userId, emailCopyRequested },
  });
};

export const getFormById = async (formId) => {
  return prisma.form.findUnique({
    where: { id: formId },
    include: { answers: true, template: true },
  });
};

export const getFormsByTemplate = async (templateId) => {
  return prisma.form.findMany({
    where: { templateId },
    include: { user: true, answers: true },
  });
};

export const getFormsByUser = async (userId) => {
  return prisma.form.findMany({
    where: { userId },
    include: { template: true, answers: true },
  });
};

export const updateForm = async (formId, answers) => {
  return prisma.$transaction(async (tx) => {
    const form = await tx.form.findUnique({
      where: { id: formId },
      include: { answers: true },
    });

    if (!form) throw new Error("Form not found");
    if (form.isFinalized) throw new Error("Cannot edit a finalized form");

    await tx.answer.deleteMany({ where: { formId } });
    await tx.answer.createMany({
      data: answers.map((answer) => ({
        formId,
        questionId: answer.questionId,
        value: answer.value,
      })),
    });

    return { message: "Form updated successfully" };
  });
};

export const deleteForm = async (formId) => {
  return prisma.form.delete({
    where: { id: formId },
    include: { answers: true },
  });
};

export const finalizeForm = async (formId, userId) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { template: true },
  });

  if (!form) throw new Error("Form not found");

  // Only form owner or template owner can finalize
  if (form.userId !== userId && form.template.ownerId !== userId) {
    throw new Error("Unauthorized to finalize this form");
  }

  return prisma.form.update({
    where: { id: formId },
    data: { isFinalized: true },
  });
};
