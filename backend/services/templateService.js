import {
  createTemplate,
  getTemplateById,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
  getTemplatesByUser
} from "../repositories/templateRepository.js";

export const createTemplateService = async (ownerId, templateData) => {
  return await createTemplate({ ...templateData, ownerId });
};

export const getTemplateByIdService = async (templateId) => {
  return await getTemplateById(templateId);
};

export const getAllTemplatesService = async (page, pageSize, userId, isAdmin) => {
  return await getAllTemplates(page, pageSize, userId, isAdmin);
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
