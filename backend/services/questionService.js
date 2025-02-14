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

export const reorderQuestionsService = async (
  orderedQuestions,
  currentUser
) => {
  console.log("🟡 [Service] Starting reorderQuestionsService...");

  // 🟠 Get the Template ID from the provided questions
  const templateId = orderedQuestions[0].templateId;

  // 🟠 Fetch All Questions from This Template
  const allQuestions = await getQuestionsByTemplateId(templateId);
  console.log("📌 [Service] Template Questions:", allQuestions);

  // 🟠 Map Provided Orders
  const providedOrderMap = new Map(
    orderedQuestions.map((q) => [q.id, q.order])
  );

  // 🟠 Separate Provided and Remaining Questions
  const reorderedQuestions = allQuestions.filter((q) =>
    providedOrderMap.has(q.id)
  );
  const remainingQuestions = allQuestions.filter(
    (q) => !providedOrderMap.has(q.id)
  );

  // 🟠 Apply Provided Orders
  reorderedQuestions.forEach((q) => {
    q.order = providedOrderMap.get(q.id);
  });

  // 🟠 Combine and Sort All Questions (Only for the Same Template)
  const combined = [...reorderedQuestions, ...remainingQuestions].sort(
    (a, b) => a.order - b.order
  );

  // 🟠 Recalculate Orders Consecutively
  const finalOrders = combined.map((q, index) => ({
    id: q.id,
    order: index,
  }));

  console.log("📌 [Service] Final Orders for Template:", finalOrders);

  // 🟠 Update Only Questions from This Template
  await batchUpdateQuestionOrders(finalOrders, templateId);
  console.log("✅ [Service] Reorder completed!");

  return { message: "Questions reordered successfully" };
};
