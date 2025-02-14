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

  // 🟠 Get All Questions for the Template
  const templateId = orderedQuestions[0].templateId; // Passed from middleware
  const allQuestions = await getQuestionsByTemplateId(templateId);
  console.log("📌 [Service] All Questions for Template:", allQuestions);

  // 🟠 Map Provided Orders
  const providedOrderMap = new Map(
    orderedQuestions.map((q) => [q.id, q.order])
  );

  // 🟠 Separate Reordered and Remaining Questions
  const reorderedQuestions = allQuestions.filter((q) =>
    providedOrderMap.has(q.id)
  );
  const remainingQuestions = allQuestions.filter(
    (q) => !providedOrderMap.has(q.id)
  );

  // 🟠 Apply Provided Orders to Reordered Questions
  reorderedQuestions.forEach((q) => {
    q.order = providedOrderMap.get(q.id);
  });

  // 🟠 Combine and Sort
  const combined = [...reorderedQuestions, ...remainingQuestions].sort(
    (a, b) => a.order - b.order
  );

  // 🟠 Assign Consecutive Orders
  const finalOrders = combined.map((q, index) => ({
    id: q.id,
    order: index,
  }));

  console.log("📌 [Service] Final Combined Orders:", finalOrders);

  // 🟠 Batch Update
  await batchUpdateQuestionOrders(finalOrders, templateId);
  console.log("✅ [Service] Questions reordered successfully!");

  return { message: "Questions reordered successfully" };
};
