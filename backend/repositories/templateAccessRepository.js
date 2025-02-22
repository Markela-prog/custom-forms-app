import prisma from "../prisma/prismaClient.js";

export const addUsersToTemplateAccess = async (templateId, userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("User IDs must be a non-empty array");
  }

  return await prisma.templateAccess.createMany({
    data: userIds.map((userId) => ({
      templateId,
      userId,
    })),
    skipDuplicates: true,
  });
};

export const removeUsersFromTemplateAccess = async (templateId, userIds) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    throw new Error("User IDs must be a non-empty array");
  }

  return await prisma.templateAccess.deleteMany({
    where: {
      templateId,
      userId: { in: userIds },
    },
  });
};

export const getTemplateAccessUsers = async (templateId) => {
  return await prisma.templateAccess.findMany({
    where: { templateId },
    include: { user: true },
  });
};

export const getNonAdminUsers = async () => {
  return await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    select: { id: true, username: true, email: true },
  });
};
