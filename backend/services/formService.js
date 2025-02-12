import {
  createForm,
  getFormById,
  getFormsByUserAndTemplate,
  getFormsByTemplate,
  getFormsByUser,
  deleteForm,
  finalizeForm,
} from "../repositories/formRepository.js";

export const createFormService = async (
  templateId,
  userId,
  emailCopyRequested
) => {
  const existingForm = await getFormsByUserAndTemplate(userId, templateId);
  if (existingForm) {
    throw new Error("You have already filled out this template");
  }

  return await createForm(templateId, userId, emailCopyRequested);
};

export const getFormByIdService = async (formId) => {
  return await getFormById(formId);
};

export const getFormsByTemplateService = async (
  templateId,
  userId,
  isAdmin
) => {
  const forms = await getFormsByTemplate(templateId);

  return forms.filter(
    (form) =>
      form.userId === userId || form.template.ownerId === userId || isAdmin
  );
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
