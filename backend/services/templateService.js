import {
  createTemplate,
  getTemplateById,
  getAllTemplates,
  updateTemplate,
  deleteTemplate,
} from "../repositories/templateRepository.js";

export const createTemplateService = async (ownerId, templateData) => {
  const newTemplate = await createTemplate({ ...templateData, ownerId });
  return newTemplate;
};

export const getTemplateByIdService = async (templateId) => {
  const template = await getTemplateById(templateId);
  if (!template || template.deletedAt) throw new Error("Template not found");
  return template;
};

export const getAllTemplatesService = async (page, pageSize) => {
  return await getAllTemplates(page, pageSize);
};

export const updateTemplateService = async (templateId, updateData) => {
  return await updateTemplate(templateId, updateData);
};

export const deleteTemplateService = async (templateId) => {
  return await deleteTemplate(templateId);
};
