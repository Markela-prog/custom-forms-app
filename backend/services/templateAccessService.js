import {
  addUserToTemplateAccess,
  removeUserFromTemplateAccess,
  getTemplateAccessUsers,
} from "../repositories/templateAccessRepository.js";

export const addUsersToTemplateAccessService = async (templateId, userIds) => {
  return await addUserToTemplateAccess(templateId, userIds);
};

export const removeUsersFromTemplateAccessService = async (templateId, userIds) => {
  return await removeUserFromTemplateAccess(templateId, userIds);
};

export const getTemplateAccessUsersService = async (templateId) => {
  return await getTemplateAccessUsers(templateId);
};
