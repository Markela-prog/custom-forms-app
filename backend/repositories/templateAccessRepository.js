import prisma from "../prisma/prismaClient.js";

export const addUserToTemplateAccess = async (templateId, userId) => {
  return await prisma.templateAccess.create({
    data: { templateId, userId },
  });
};

export const removeUserFromTemplateAccess = async (templateId, userId) => {
  return await prisma.templateAccess.delete({
    where: {
      templateId_userId: { templateId, userId },
    },
  });
};

export const getTemplateAccessUsers = async (templateId) => {
  return await prisma.templateAccess.findMany({
    where: { templateId },
    include: { user: true },
  });
};