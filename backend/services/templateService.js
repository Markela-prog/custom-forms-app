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

export const getTemplateByIdService = async (templateId, userId, isAdmin) => {
  const template = await getTemplateById(templateId);
  if (!template || template.deletedAt) throw new Error("Template not found");

  // Allow if public
  if (template.isPublic) return template;

  // Allow if the user is the owner or an admin
  if (template.ownerId === userId || isAdmin) return template;

  // Check if the user has access
  const hasAccess = template.accessControl.some(
    (access) => access.userId === userId
  );
  if (!hasAccess) throw new Error("Unauthorized: No access to this template");

  return template;
};

export const getAllTemplatesService = async (page = 1, pageSize = 10, userId) => {
  return prisma.template.findMany({
    where: {
      OR: [
        { isPublic: true },
        { ownerId: userId },
        {
          accessControl: { some: { userId } },
        },
      ],
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { owner: true, tags: { include: { tag: true } } },
  });
};


export const updateTemplateService = async (templateId, updateData) => {
  return await updateTemplate(templateId, updateData);
};

export const deleteTemplateService = async (templateId) => {
  return await deleteTemplate(templateId);
};
