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

export const getFormById = async (formId, includeAnswers = false) => {
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

export const deleteForm = async (formId) => {
  return await prisma.$transaction(async (tx) => {
    // ✅ Step 1: Delete Answers Related to the Form
    await tx.answer.deleteMany({
      where: { formId },
    });

    // ✅ Step 2: Delete the Form
    return await tx.form.delete({
      where: { id: formId },
    });
  });
};
