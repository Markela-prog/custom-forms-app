import prisma from "../prisma/prismaClient.js";

export const findLike = async (userId, templateId) => {
  return prisma.like.findUnique({
    where: { templateId_userId: { userId, templateId } },
  });
};

export const createLike = async (userId, templateId) => {
  return prisma.like.create({
    data: { userId, templateId },
  });
};

export const deleteLike = async (userId, templateId) => {
  return prisma.like.delete({
    where: { templateId_userId: { userId, templateId } },
  });
};

export const countLikes = async (templateId) => {
  return prisma.like.count({
    where: { templateId },
  });
};

export const updateTemplateLikes = async (templateId, totalLikes) => {
  return prisma.templateStats.upsert({
    where: { templateId },
    update: { totalLikes },
    create: { templateId, totalLikes },
  });
};
