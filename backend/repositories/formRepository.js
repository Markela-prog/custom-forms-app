import prisma from "../prisma/prismaClient.js";

export const createForm = async (templateId, userId, emailCopyRequested) => {
  return prisma.form.create({
    data: {
      templateId,
      userId,
      emailCopyRequested,
    },
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

export const deleteForm = async (formId) => {
  return prisma.form.delete({
    where: { id: formId },
  });
};

export const finalizeForm = async (formId) => {
  return prisma.form.update({
    where: { id: formId },
    data: { isFinalized: true },
  });
};
