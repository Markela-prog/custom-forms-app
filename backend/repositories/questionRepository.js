import prisma from "../prisma/prismaClient.js";

export const createQuestion = async (templateId, questionData) => {
  return prisma.question.create({
    data: { ...questionData, templateId },
  });
};

export const getQuestionsByTemplateId = async (templateId) => {
  return prisma.question.findMany({
    where: { templateId },
    orderBy: { order: "asc" }, // Ensure correct order
  });
};

export const updateQuestion = async (questionId, updateData) => {
  return prisma.question.update({
    where: { id: questionId },
    data: updateData,
  });
};

export const deleteQuestion = async (questionId) => {
  return prisma.question.delete({
    where: { id: questionId },
  });
};

export const reorderQuestions = async (orderedQuestions) => {
  const updatePromises = orderedQuestions.map((question, index) =>
    prisma.question.update({
      where: { id: question.id },
      data: { order: index },
    })
  );
  return Promise.all(updatePromises);
};
