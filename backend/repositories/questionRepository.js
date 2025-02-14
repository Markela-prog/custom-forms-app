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
  console.log("🟡 [Repository] Fetching questions by IDs:", questionIds);

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, templateId: true },
  });

  console.log("📌 [Repository] Questions Fetched from DB:", questions);
  return questions;
};

// ✅ Batch Update Orders (Scoped by Template)
export const batchUpdateQuestionOrders = async (
  orderedQuestions,
  templateId
) => {
  console.log(
    "🟡 [Repository] Starting batch update for Template ID:",
    templateId
  );

  const updatePromises = orderedQuestions.map(({ id, order }) =>
    prisma.question
      .update({
        where: {
          id,
          templateId, // Scoped to Template
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
  console.log("✅ [Repository] Batch update completed successfully.");
};
