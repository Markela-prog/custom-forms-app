import {
  createTemplate,
  getTemplateById,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
  getTemplatesByUser,
} from "../repositories/templateRepository.js";
import { findLike, countLikes } from "../repositories/likeRepository.js";
import prisma from "../prisma/prismaClient.js";

export const createTemplateService = async (ownerId, templateData) => {
  return await createTemplate({ ...templateData, ownerId });
};

export const getTemplateByIdService = async (templateId, userId) => {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  const userLike = userId ? await findLike(userId, templateId) : null;

  const totalLikes = await countLikes(templateId);

  return {
    ...template,
    isLikedByUser: Boolean(userLike),
    stats: { totalLikes },
  };
};

export const getAllTemplatesService = async (
  page,
  pageSize,
  userId,
  isAdmin
) => {
  const templates = await getAllTemplates(page, pageSize, userId, isAdmin);

  if (!userId) {
    return templates.map((template) => ({ ...template, isLikedByUser: false }));
  }

  const likesData = await prisma.templateStats.findMany({
    select: { templateId: true, totalLikes: true },
  });


  const likesMap = new Map(
    likesData.map((like) => [like.templateId, like.totalLikes])
  );

  let likedTemplateIds = new Set();
  if (userId) {
    const userLikes = await prisma.like.findMany({
      where: { userId },
      select: { templateId: true },
    });
    likedTemplateIds = new Set(userLikes.map((like) => like.templateId));
  }

  return templates.map((template) => ({
    ...template,
    stats: {
      totalLikes: likesMap.get(template.id) || 0, 
    },
    isLikedByUser: userId ? likedTemplateIds.has(template.id) : false, 
  }));
};

export const getTemplatesByUserService = async (userId) => {
  return await getTemplatesByUser(userId);
};

export const updateTemplateService = async (templateId, updateData) => {
  return await updateTemplate(templateId, updateData);
};

export const deleteTemplateService = async (templateId) => {
  return await deleteTemplate(templateId);
};
