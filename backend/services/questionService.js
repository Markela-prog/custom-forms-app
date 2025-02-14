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

  const orders = orderedQuestions.map((q) => q.order);

  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    throw new Error("Duplicate order values found");
  }

  await batchUpdateQuestionOrders(orderedQuestions, templateId);

  return { message: "Questions reordered successfully" };
};
