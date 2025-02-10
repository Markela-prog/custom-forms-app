import prisma from "../prisma/prismaClient.js";

export const getUserDashboardData = async (userId) => {
  const templates = await prisma.template.findMany({
    where: { ownerId: userId },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
    },
  });

  const submittedForms = await prisma.form.findMany({
    where: { userId },
    select: {
      id: true,
      templateId: true,
      createdAt: true,
    },
  });

  return { templates, submittedForms };
};
