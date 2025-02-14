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

export const reorderQuestions = async (orderedQuestions) => {
  try {
    const updatePromises = orderedQuestions.map((question, index) =>
      prisma.question.update({
        where: { id: question.id },
        data: { order: index },
      })
    );

    return await prisma.$transaction(updatePromises);
  } catch (error) {
    throw new Error(`Failed to reorder questions: ${error.message}`);
  }
};
