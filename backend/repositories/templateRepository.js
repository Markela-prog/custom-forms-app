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
      accessControl: true, // Needed for permission checks
    },
  });
};

export const getAllTemplates = async (page = 1, pageSize = 10, userId) => {
  const query = {
    where: {
      OR: [{ isPublic: true }],
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { owner: true, tags: { include: { tag: true } } },
  };

  // If user is authenticated, include private templates they have access to
  if (userId) {
    query.where.OR.push(
      { ownerId: userId }, // Templates the user owns
      { accessControl: { some: { userId } } } // Templates where user has explicit access
    );
  }

  return prisma.template.findMany(query);
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
