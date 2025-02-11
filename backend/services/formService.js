import {
  createForm,
  getFormById,
  getFormsByTemplate,
  getFormsByUser,
  deleteForm,
  updateForm,
  finalizeForm,
} from "../repositories/formRepository.js";

export const createFormService = async (
  templateId,
  userId,
  emailCopyRequested
) => {
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

export const deleteFormService = async (formId, userId) => {
  const form = await getFormById(formId);
  if (!form) throw new Error("Form not found");

  if (form.userId !== userId && form.template.ownerId !== userId) {
    throw new Error("Unauthorized to delete this form");
  }

  return await deleteForm(formId);
};

export const finalizeFormService = async (formId, userId) => {
  return await finalizeForm(formId, userId);
};
