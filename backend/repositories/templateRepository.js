import prisma from "../prisma/prismaClient.js";

export const createTemplate = async (templateData) => {
  return prisma.template.create({
    data: templateData,
    include: { questions: true, tags: { include: { tag: true } } },
  });
};

export const getTemplateById = async (templateId) => {
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      owner: true,
      questions: true,
      tags: { include: { tag: true } },
      accessControl: true,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
};

export const getAllTemplates = async (
  page = 1,
  pageSize = 20,
  userId,
  isAdmin
) => {
  let whereClause = {};

  if (!userId) {
    whereClause = { isPublic: true };
  } else if (isAdmin) {
    whereClause = {};
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
      stats: true,
    },
  });
};

export const getTemplatesByUser = async (userId) => {
  return prisma.template.findMany({
    where: { ownerId: userId },
    include: {
      tags: { include: { tag: true } },
      questions: true,
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
  return prisma.$transaction(async (prisma) => {
    await prisma.answer.deleteMany({
      where: {
        question: {
          templateId: templateId,
        },
      },
    });

    await prisma.question.deleteMany({
      where: {
        templateId: templateId,
      },
    });

    await prisma.form.deleteMany({
      where: {
        templateId: templateId,
      },
    });

    await prisma.template.delete({
      where: {
        id: templateId,
      },
    });
  });
};
