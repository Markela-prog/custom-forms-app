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

  // 🟠 Validate Template Uniqueness
  const questionIds = orderedQuestions.map((q) => q.id);
  const dbQuestions = await getQuestionsByIds(questionIds);

  if (dbQuestions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  const templateId = dbQuestions[0]?.templateId;
  const uniqueTemplate = dbQuestions.every((q) => q.templateId === templateId);

  if (!uniqueTemplate) {
    throw new Error("All questions must belong to the same template");
  }

  // 🟠 Fetch All Template Questions for Accurate Ordering
  const allQuestions = await getQuestionsByTemplateId(templateId);
  console.log("📌 [Service] All Questions for Template:", allQuestions);

  // 🟠 Separate Provided and Remaining Questions
  const providedIds = orderedQuestions.map((q) => q.id);
  const remainingQuestions = allQuestions.filter(
    (q) => !providedIds.includes(q.id)
  );

  // 🟠 Merge Partial Reorder
  const sortedProvided = [...orderedQuestions].sort(
    (a, b) => a.order - b.order
  );

  const combined = [...sortedProvided, ...remainingQuestions].map(
    (q, index) => ({
      id: q.id,
      order: index,
    })
  );

  console.log("📌 [Service] Final Orders for Template:", combined);

  // 🟠 Update Orders (Scoped to Template)
  await batchUpdateQuestionOrders(combined, templateId);
  console.log("✅ [Service] Questions reordered successfully!");

  return { message: "Questions reordered successfully" };
};
