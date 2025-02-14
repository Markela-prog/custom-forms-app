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
  // 1️⃣ Get All Questions from Database
  const questionIds = orderedQuestions.map(q => q.id);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { template: true },
  });

  if (questions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  // 2️⃣ Ensure All Questions Are from the Same Template
  const templateId = questions[0].templateId;
  const uniqueTemplateCheck = questions.every(
    (q) => q.templateId === templateId
  );
  if (!uniqueTemplateCheck) {
    throw new Error("All questions must belong to the same template");
  }

  // 3️⃣ Ensure Orders Are Unique
  const orders = orderedQuestions.map((q) => q.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    throw new Error("Duplicate order values found");
  }

  // 4️⃣ Batch Update Orders for Questions (Within Template Scope)
  const updatePromises = orderedQuestions.map(({ id, order }) =>
    prisma.question.update({
      where: {
        id,
        templateId, // <- Scoped to template
      },
      data: { order },
    })
  );

  // 5️⃣ Execute Batch Update
  await Promise.all(updatePromises);

  return { message: "Questions reordered successfully" };
};
