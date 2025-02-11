import {
    createForm,
    getFormById,
    getFormsByTemplate,
    getFormsByUser,
    deleteForm,
    finalizeForm,
  } from "../repositories/formRepository.js";
  
  export const createFormService = async (templateId, userId, emailCopyRequested) => {
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
  
  export const finalizeFormService = async (formId) => {
    return await finalizeForm(formId);
  };
  