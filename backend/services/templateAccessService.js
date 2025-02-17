import {
  addUserToTemplateAccess,
  removeUserFromTemplateAccess,
  getTemplateAccessUsers,
} from "../repositories/templateAccessRepository.js";

export const addUserToTemplateAccessService = async (templateId, userId) => {
  return await addUserToTemplateAccess(templateId, userId);
};

export const removeUserFromTemplateAccessService = async (templateId, userId) => {
  return await removeUserFromTemplateAccess(templateId, userId);
};

export const getTemplateAccessUsersService = async (templateId) => {
  return await getTemplateAccessUsers(templateId);
};
