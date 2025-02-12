import prisma from "../prisma/prismaClient.js";

export const createTemplate = async (templateData) => {
  return prisma.template.create({
    data: templateData,
    include: { questions: true, tags: { include: { tag: true } } },
  });
};

export const getTemplateById = async (templateId) => {
  return prisma.template.findUnique({
    where: { id: templateId },
    include: {
      owner: true,
      questions: true,
      tags: { include: { tag: true } },
      accessControl: true,
    },
  });
};

export const getAllTemplates = async (
  page = 1,
  pageSize = 10,
  userId,
  isAdmin
) => {
  let whereClause = {};

  if (!userId) {
    whereClause = { isPublic: true };
  } else if (isAdmin) {
    whereClause = {
      deletedAt: null,
    };
  } else {
    whereClause = {
      OR: [
        { isPublic: true },
        { ownerId: userId },
        { accessControl: { some: { userId } } },
      ],
    };
  }

  return prisma.template.findMany({
    where: whereClause,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      owner: true,
      tags: { include: { tag: true } },
      accessControl: true,
    },
  });
};

export const updateTemplate = async (templateId, updateData) => {
  return prisma.template.update({
    where: { id: templateId },
    data: updateData,
    include: { questions: true, tags: { include: { tag: true } } },
  });
};

export const deleteTemplate = async (templateId) => {
  return prisma.template.update({
    where: { id: templateId },
    data: { deletedAt: new Date() },
  });
};
