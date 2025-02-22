import {
  createQuestions,
  getQuestionsByTemplateId,
  bulkUpdateQuestions,
  bulkDeleteQuestions,
  getQuestionsByIds,
  batchUpdateQuestionOrders,
} from "../repositories/questionRepository.js";

export const createQuestionsService = async (templateId, questions) => {
  return await createQuestions(templateId, questions);
};

export const getQuestionsByTemplateService = async (templateId) => {
  return await getQuestionsByTemplateId(templateId);
};

// 🟠 Service for Bulk Updating Questions
export const updateMultipleQuestionsService = async (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid question update data");
  }

  return await bulkUpdateQuestions(questions);
};

// 🟠 Service for Bulk Deleting Questions
export const deleteMultipleQuestionsService = async (questionIds) => {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error("Invalid question delete data");
  }

  return await bulkDeleteQuestions(questionIds);
};

export const reorderQuestionsService = async (orderedQuestions, templateId) => {
  // 🟠 Validate Orders Format
  validateOrders(orderedQuestions);

  // 🟠 Perform Reorder by Assigning Consecutive Order
  const sorted = orderedQuestions.sort((a, b) => a.order - b.order);
  const finalOrders = sorted.map((q, index) => ({
    id: q.id,
    order: index,
  }));

  // 🟠 Batch Update Orders
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
