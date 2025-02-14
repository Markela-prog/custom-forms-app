import prisma from "../prisma/prismaClient.js";

export const createQuestion = async (templateId, questionData) => {
  const highestOrder = await prisma.question.aggregate({
    where: { templateId },
    _max: { order: true },
  });

  const newOrder =
    highestOrder._max.order !== null ? highestOrder._max.order + 1 : 0;

  return prisma.question.create({
    data: {
      ...questionData,
      templateId,
      order: newOrder,
    },
  });
};

export const getQuestionsByTemplateId = async (templateId) => {
  return prisma.question.findMany({
    where: { templateId },
    orderBy: { order: "asc" },
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

export const getQuestionsByIds = async (questionIds) => {
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, templateId: true },
  });

  return questions;
};

export const batchUpdateQuestionOrders = async (
  orderedQuestions,
  templateId
) => {
  const updatePromises = orderedQuestions.map(({ id, order }) =>
    prisma.question
      .update({
        where: {
          id,
          templateId,
        },
        data: { order },
      })
      .catch((error) => {
        console.error(
          `❌ [Repository] Failed to update question ${id}:`,
          error.message
        );
        throw error;
      })
  );

  await Promise.all(updatePromises);
};
