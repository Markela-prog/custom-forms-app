import prisma from "../prisma/prismaClient.js";

export const createTemplate = async (templateData) => {
  return prisma.template.create({
    data: templateData,
    include: { questions: true, tags: true },
  });
};

export const getTemplateById = async (templateId) => {
  return prisma.template.findUnique({
    where: { id: templateId },
    include: { owner: true, questions: true, tags: { include: { tag: true } } },
  });
};

export const getAllTemplates = async (page = 1, pageSize = 10) => {
  return prisma.template.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { owner: true, tags: { include: { tag: true } } },
  });
};

export const updateTemplate = async (templateId, updateData) => {
  return prisma.template.update({
    where: { id: templateId },
    data: updateData,
    include: { questions: true, tags: true },
  });
};

export const deleteTemplate = async (templateId) => {
  return prisma.template.update({
    where: { id: templateId },
    data: { deletedAt: new Date() },
  });
};