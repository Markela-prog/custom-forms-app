import {
  createQuestion,
  getQuestionsByTemplateId,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
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

  const orderSet = new Set(orderedQuestions.map((q) => q.order));
  if (orderSet.size !== orderedQuestions.length) {
    throw new Error("Duplicate order values found: Order must be unique within the template");
  }

  return await reorderQuestions(orderedQuestions);
};
