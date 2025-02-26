import {
  createTemplate,
  getTemplateById,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
  getTemplatesByUser,
} from "../repositories/templateRepository.js";
import { findLike } from "../repositories/likeRepository.js";
import prisma from "../prisma/prismaClient.js";

export const createTemplateService = async (ownerId, templateData) => {
  return await createTemplate({ ...templateData, ownerId });
};

export const getTemplateByIdService = async (templateId, userId) => {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  // Fetch whether the user has liked this template
  const userLike = userId ? await findLike(userId, templateId) : null;

  const totalLikes = await countLikes(templateId);

  return { ...template, isLikedByUser: Boolean(userLike), totalLikes };
};

export const getAllTemplatesService = async (page, pageSize, userId, isAdmin) => {
  const templates = await getAllTemplates(page, pageSize, userId, isAdmin);

  if (!userId) {
    // If the user is not logged in, return templates without `isLikedByUser`
    return templates.map((template) => ({ ...template, isLikedByUser: false }));
  }

  // Fetch user likes separately
  const userLikes = await prisma.like.findMany({
    where: { userId },
    select: { templateId: true },
  });

  const likedTemplateIds = new Set(userLikes.map((like) => like.templateId));

  return templates.map((template) => ({
    ...template,
    isLikedByUser: likedTemplateIds.has(template.id),
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
