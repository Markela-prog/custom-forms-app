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

export const getAllTemplates = async (
  page = 1,
  pageSize = 10,
  userId,
  isAdmin
) => {
  let whereClause = {};

  if (!userId) {
    // ✅ Non-authenticated users: Only public templates
    whereClause = { isPublic: true };
  } else if (isAdmin) {
    // ✅ Admins see everything (ignore public/private filter)
    whereClause = {
      deletedAt: null, // Ensure we don’t fetch soft-deleted templates
    };
  } else {
    // ✅ Regular Authenticated Users
    whereClause = {
      OR: [
        { isPublic: true }, // Public templates
        { ownerId: userId }, // Templates owned by user
        { accessControl: { some: { userId } } }, // Templates user has explicit access to
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
