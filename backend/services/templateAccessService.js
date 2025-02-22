import {
  addUsersToTemplateAccess,
  removeUsersFromTemplateAccess,
  getTemplateAccessUsers,
  getNonAdminUsers,
} from "../repositories/templateAccessRepository.js";

export const addUsersToTemplateAccessService = async (templateId, userIds) => {
  return await addUsersToTemplateAccess(templateId, userIds);
};

export const removeUsersFromTemplateAccessService = async (
  templateId,
  userIds
) => {
  return await removeUsersFromTemplateAccess(templateId, userIds);
};

export const getTemplateAccessUsersService = async (templateId) => {
  return await getTemplateAccessUsers(templateId);
};

export const getNonAdminUsersService = async () => {
  return await getNonAdminUsers();
};
