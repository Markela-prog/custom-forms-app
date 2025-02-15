import {
  createForm,
  getFormById,
  getFormsByUserAndTemplate,
  getFormsByTemplate,
  getFormsByUser,
  deleteForm,
  finalizeForm,
} from "../repositories/formRepository.js";

export const createFormService = async (templateId, userId, emailCopyRequested) => {
  const existingForm = await getFormsByUserAndTemplate(userId, templateId);
  if (existingForm) {
    throw new Error("You have already filled out this template");
  }

  return await createForm(templateId, userId, emailCopyRequested);
};

export const getFormByIdService = async (formId) => {
  return await getFormById(formId);
};

export const getFormsByTemplateService = async (templateId) => {
  return await getFormsByTemplate(templateId);
};

export const getFormsByUserService = async (userId) => {
  return await getFormsByUser(userId);
};

export const deleteFormService = async (formId) => {
  return await deleteForm(formId);
};