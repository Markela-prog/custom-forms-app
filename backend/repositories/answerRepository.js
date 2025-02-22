import prisma from "../prisma/prismaClient.js";

export const submitAnswersAndFinalize = async (formId, answers) => {
  return await prisma.$transaction(async (tx) => {
    const createdAnswers = await tx.answer.createMany({
      data: answers.map((answer) => ({
        formId,
        questionId: answer.questionId,
        value: answer.value,
      })),
    });

    const finalizedForm = await tx.form.update({
      where: { id: formId },
      data: { isFinalized: true },
    });

    return {
      form: finalizedForm,
      answersCount: createdAnswers.count,
    };
  });
};

export const getAnswerWithQuestion = async (formId, answerId) => {
  return prisma.answer.findUnique({
    where: { id: answerId, formId },
    include: { question: true },
  });
};

export const updateAnswer = async (formId, answerId, value) => {
  return prisma.answer.update({
    where: { id: answerId, formId },
    data: { value },
  });
};

export const deleteAnswer = async (formId, answerId) => {
  return prisma.answer.delete({
    where: { id: answerId, formId },
  });
};
