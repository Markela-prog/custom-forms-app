import prisma from "../prisma/prismaClient.js";

export const submitAnswers = async (formId, answers) => {
  return prisma.answer.createMany({
    data: answers.map((answer) => ({
      formId,
      questionId: answer.questionId,
      value: answer.value,
    })),
  });
};

export const getAnswersByFormId = async (formId) => {
  return prisma.answer.findMany({
    where: { formId },
    include: { question: true },
  });
};

export const deleteAnswersByFormId = async (formId) => {
  return prisma.answer.deleteMany({
    where: { formId },
  });
};
