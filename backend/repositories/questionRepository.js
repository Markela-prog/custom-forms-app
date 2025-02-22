import prisma from "../prisma/prismaClient.js";

export const createQuestions = async (templateId, questions) => {
  if (!Array.isArray(questions)) {
    throw new Error("Invalid data: questions must be an array");
  }

  console.log("📌 Creating Questions:", questions); // Debugging log

  const highestOrder = await prisma.question.aggregate({
    where: { templateId },
    _max: { order: true },
  });

  let order =
    highestOrder._max.order !== null ? highestOrder._max.order + 1 : 0;

  const questionsWithOrder = questions.map((q) => ({
    ...q,
    templateId,
    order: order++,
  }));

  return prisma.question.createMany({
    data: questionsWithOrder,
  });
};

export const getQuestionsByTemplateId = async (templateId) => {
  return prisma.question.findMany({
    where: { templateId },
    orderBy: { order: "asc" },
  });
};

export const getQuestionIdsByTemplate = async (
  templateId,
  requiredOnly = false
) => {
  const questions = await prisma.question.findMany({
    where: {
      templateId,
      ...(requiredOnly && { isRequired: true }),
    },
    select: { id: true },
  });

  return questions.map((q) => q.id);
};

export const bulkUpdateQuestions = async (questions) => {
  const updatePromises = questions.map(({ id, ...updateData }) =>
    prisma.question.update({
      where: { id },
      data: updateData,
    })
  );

  await Promise.all(updatePromises);
  return { message: "Questions updated successfully" };
};

export const bulkDeleteQuestions = async (questionIds) => {
  await prisma.question.deleteMany({
    where: { id: { in: questionIds } },
  });

  return { message: "Questions deleted successfully" };
};

export const getQuestionsByIds = async (questionIds) => {
  return prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, templateId: true },
  });
};

export const batchUpdateQuestionOrders = async (
  orderedQuestions,
  templateId
) => {
  const updatePromises = orderedQuestions.map(({ id, order }) =>
    prisma.question.update({
      where: { id, templateId },
      data: { order },
    })
  );
  await Promise.all(updatePromises);
  console.log("✅ [Repository] Batch update completed.");
};

export const getRequiredQuestions = async (templateId) => {
  return prisma.question.findMany({
    where: {
      templateId,
      isRequired: true,
    },
    select: { id: true, title: true },
  });
};
