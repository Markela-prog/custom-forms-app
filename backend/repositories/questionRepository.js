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
  const questionIds = orderedQuestions.map((q) => q.id);

  // 1️⃣ Fetch All Questions from DB
  const dbQuestions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, templateId: true },
  });

  // 2️⃣ Check if All Questions Exist
  if (dbQuestions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  // 3️⃣ Ensure All Questions Are from the Same Template
  const templateId = dbQuestions[0].templateId;
  const uniqueTemplateCheck = dbQuestions.every(
    (q) => q.templateId === templateId
  );
  if (!uniqueTemplateCheck) {
    throw new Error("All questions must belong to the same template");
  }

  // 4️⃣ Ensure Unique Order Values
  const orders = orderedQuestions.map((q) => q.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    throw new Error("Duplicate order values found");
  }

  // 5️⃣ Batch Update Orders for Questions (With Correct Scope)
  const updatePromises = orderedQuestions.map(({ id, order }) =>
    prisma.question.update({
      where: {
        id, // ✅ Correct Question ID
        templateId: templateId, // ✅ Add Template Scope
      },
      data: { order },
    })
  );

  // 6️⃣ Execute Batch Update
  await Promise.all(updatePromises);

  return { message: "Questions reordered successfully" };
};
