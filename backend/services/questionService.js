import {
  createQuestions,
  getQuestionsByTemplateId,
  bulkUpdateQuestions,
  bulkDeleteQuestions,
  batchUpdateQuestionOrders,
} from "../repositories/questionRepository.js";

export const createQuestionsService = async (templateId, questions) => {
  return await createQuestions(templateId, questions);
};

export const getQuestionsByTemplateService = async (templateId) => {
  return await getQuestionsByTemplateId(templateId);
};

export const updateMultipleQuestionsService = async (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid question update data");
  }

  return await bulkUpdateQuestions(questions);
};

export const deleteMultipleQuestionsService = async (questionIds) => {
  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    throw new Error("Invalid question delete data");
  }

  return await bulkDeleteQuestions(questionIds);
};

export const reorderQuestionsService = async (orderedQuestions, templateId) => {
  validateOrders(orderedQuestions);

  const sorted = orderedQuestions.sort((a, b) => a.order - b.order);
  const finalOrders = sorted.map((q, index) => ({
    id: q.id,
    order: index,
  }));

  await batchUpdateQuestionOrders(finalOrders, templateId);

  return { message: "Questions reordered successfully" };
};

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
