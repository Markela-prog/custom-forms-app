import {
  createQuestion,
  getQuestionsByTemplateId,
  updateQuestion,
  deleteQuestion,
  getQuestionsByIds,
  batchUpdateQuestionOrders,
} from "../repositories/questionRepository.js";

export const createQuestionService = async (templateId, questionData) => {
  return await createQuestion(templateId, questionData);
};

export const getQuestionsByTemplateService = async (templateId) => {
  return await getQuestionsByTemplateId(templateId);
};

export const updateQuestionService = async (questionId, updateData) => {
  return await updateQuestion(questionId, updateData);
};

export const deleteQuestionService = async (questionId) => {
  return await deleteQuestion(questionId);
};

export const reorderQuestionsService = async (orderedQuestions) => {
  console.log("🟡 [Service] Starting reorderQuestionsService...");

  const questionIds = orderedQuestions.map((q) => q.id);
  const dbQuestions = await getQuestionsByIds(questionIds);
  if (dbQuestions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  // 🟠 Merge Partial Reorder
  const allQuestions = await getQuestionsByTemplateId(
    dbQuestions[0].templateId
  );
  const providedIds = orderedQuestions.map((q) => q.id);

  const remainingQuestions = allQuestions
    .filter((q) => !providedIds.includes(q.id))
    .sort((a, b) => a.order - b.order);

  const sortedProvided = [...orderedQuestions].sort(
    (a, b) => a.order - b.order
  );
  const combined = [...sortedProvided, ...remainingQuestions].map(
    (q, index) => ({
      id: q.id,
      order: index,
    })
  );

  // 🟠 Batch Update
  await batchUpdateQuestionOrders(combined, dbQuestions[0].templateId);
  console.log("✅ [Service] Questions reordered successfully!");

  return { message: "Questions reordered successfully" };
};
