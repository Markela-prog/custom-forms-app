import prisma from "../prisma/prismaClient.js";

export const submitAnswers = async (formId, answers) => {
  return await prisma.answer.createMany({
    data: answers.map((answer) => ({
      formId,
      questionId: answer.questionId,
      value: answer.value,
    })),
  });
};

export const getAnswersByForm = async (formId) => {
  return await prisma.answer.findMany({
    where: { formId },
    include: {
      question: {
        select: { title: true, type: true },
      },
    },
  });
};
