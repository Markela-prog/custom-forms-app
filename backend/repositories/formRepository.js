import prisma from "../prisma/prismaClient.js";

export const createForm = async (templateId, userId, emailCopyRequested) => {
  return prisma.form.create({
    data: { templateId, userId, emailCopyRequested },
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
  });
};

export const getFormsByUserAndTemplate = async (userId, templateId) => {
  return prisma.form.findFirst({
    where: { userId, templateId },
  });
};

export const deleteForm = async (formId) => {
  return prisma.form.delete({
    where: { id: formId },
    include: { answers: true },
  });
};