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

  // 🟠 Validate Template Scope
  const questionIds = orderedQuestions.map((q) => q.id);
  const dbQuestions = await getQuestionsByIds(questionIds);
  if (dbQuestions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  const templateId = dbQuestions[0].templateId;
  const uniqueTemplate = dbQuestions.every((q) => q.templateId === templateId);
  if (!uniqueTemplate) {
    throw new Error("All questions must belong to the same template");
  }

  // 🟠 Fetch All Questions for Template
  const allQuestions = await getQuestionsByTemplateId(templateId);
  console.log("📌 [Service] All Questions for Template:", allQuestions);

  // 🟠 Create Order Mapping for Provided Questions
  const providedOrders = new Map(orderedQuestions.map((q) => [q.id, q.order]));

  // 🟠 Separate Provided and Remaining Questions
  const remainingQuestions = allQuestions.filter(
    (q) => !providedOrders.has(q.id)
  );

  // 🟠 Merge and Recalculate Orders Consecutively
  const combined = [
    ...orderedQuestions.map(({ id }) => ({ id })),
    ...remainingQuestions.map(({ id }) => ({ id })),
  ].map((item, index) => ({
    id: item.id,
    order: index,
  }));

  console.log("📌 [Service] Final Consecutive Orders:", combined);

  // 🟠 Update Orders in Database
  await batchUpdateQuestionOrders(combined, templateId);
  console.log("✅ [Service] Questions reordered successfully!");

  return { message: "Questions reordered successfully" };
};
