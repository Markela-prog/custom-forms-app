import {
  addUserToTemplateAccess,
  removeUserFromTemplateAccess,
  getTemplateAccessUsers,
} from "../repositories/templateAccessRepository.js";
import { getTemplateById } from "../repositories/templateRepository.js";

export const addUserToTemplateAccessService = async (
  templateId,
  ownerId,
  userId
) => {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  if (template.ownerId !== ownerId) {
    throw new Error("Unauthorized: Only the owner can add users");
  }

  return await addUserToTemplateAccess(templateId, userId);
};

export const removeUserFromTemplateAccessService = async (
  templateId,
  ownerId,
  userId
) => {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  if (template.ownerId !== ownerId) {
    throw new Error("Unauthorized: Only the owner can remove users");
  }

  return await removeUserFromTemplateAccess(templateId, userId);
};

export const getTemplateAccessUsersService = async (templateId, ownerId) => {
  const template = await getTemplateById(templateId);
  if (!template) throw new Error("Template not found");

  if (template.ownerId !== ownerId) {
    throw new Error("Unauthorized: Only the owner can view access list");
  }

  return await getTemplateAccessUsers(templateId);
};
