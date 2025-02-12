import {
  createQuestion,
  getQuestionsByTemplateId,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../repositories/questionRepository.js";
import { getTemplateById } from "../repositories/templateRepository.js";


export const createQuestionService = async (templateId, userId, isAdmin, questionData) => {
    const template = await getTemplateById(templateId);
    if (!template) throw new Error("Template not found");
  
    if (template.ownerId !== userId && !isAdmin) {
      throw new Error("Unauthorized: Only template owner or admin can add questions");
    }
  
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
  return await reorderQuestions(orderedQuestions);
};
