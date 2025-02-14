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

export const reorderQuestionsService = async (orderedQuestions, templateId) => {
  // 🟠 Validate Order Format
  validateOrders(orderedQuestions);

  // 🟠 Perform Reorder
  const sorted = orderedQuestions.sort((a, b) => a.order - b.order);
  const finalOrders = sorted.map((q, index) => ({
    id: q.id,
    order: index,
  }));

  await batchUpdateQuestionOrders(finalOrders, templateId);
  return { message: "Questions reordered successfully" };
};

// ✅ Utility: Validate Orders Are Unique and Continuous
const validateOrders = (questions) => {
  const orders = questions.map((q) => q.order);
  const uniqueOrders = new Set(orders);

  if (uniqueOrders.size !== orders.length) {
    throw new Error("Duplicate order values found");
  }

  const minOrder = Math.min(...orders);
  const maxOrder = Math.max(...orders);
  if (minOrder !== 0 || maxOrder !== orders.length - 1) {
    throw new Error("Order values must be consecutive and start from 0");
  }
};