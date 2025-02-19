import prisma from "../prisma/prismaClient.js";

export const createForm = async (templateId, userId, emailCopyRequested) => {
  return prisma.form.create({
    data: {
      templateId,
      userId,
      emailCopyRequested,
      isFinalized: false,
      createdAt: new Date(),
    },
  });
};

export const getFormById = async (formId, includeAnswers = true) => {
  return prisma.form.findUnique({
    where: { id: formId },
    include: {
      template: true,
      answers: includeAnswers,
    },
  });
};

export const getFormsByTemplate = async (templateId) => {
  return prisma.form.findMany({
    where: { templateId },
    include: { user: true },
  });
};

export const getFormsByUser = async (userId) => {
  return prisma.form.findMany({
    where: { userId },
    include: { template: true, answers: true },
  });
};

export const getFormsByUserAndTemplate = async (userId, templateId) => {
  return prisma.form.findFirst({
    where: { userId, templateId },
  });
};

export const deleteForm = async (formId, user) => {

  const form = await prisma.form.findUnique({
    where: { id: formId },
    select: { userId: true },
  });

  if (!form) {
    throw new Error("Form not found");
  }

  // 🛡️ Allow only Admins or Form Owners to delete
  if (user.role !== "ADMIN" && user.id !== form.userId) {
    throw new Error("Only the form owner or admin can delete this form");
  }

  return await prisma.$transaction(async (tx) => {
    await tx.answer.deleteMany({ where: { formId } });

    return await tx.form.delete({ where: { id: formId } });
  });
};
