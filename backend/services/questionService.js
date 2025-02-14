import {
  createQuestion,
  getQuestionsByTemplateId,
  updateQuestion,
  deleteQuestion,
  getQuestionsByIds, 
  batchUpdateQuestionOrders
} from "../repositories/questionRepository.js";
import { getTemplateOwnership } from "../repositories/templateRepository.js";

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

export const reorderQuestionsService = async (orderedQuestions, currentUser) => {
  const questionIds = orderedQuestions.map(q => q.id);

  // 1️⃣ Get All Questions by IDs
  const dbQuestions = await getQuestionsByIds(questionIds);

  // 2️⃣ Validate: All Questions Exist
  if (dbQuestions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  // 3️⃣ Validate: All Questions Belong to One Template
  const templateId = dbQuestions[0].templateId;
  const uniqueTemplate = dbQuestions.every(q => q.templateId === templateId);
  if (!uniqueTemplate) {
    throw new Error("All questions must belong to the same template");
  }

  // 4️⃣ Validate: Template Ownership or Admin
  const template = await getTemplateOwnership(templateId);
  if (!template) throw new Error("Template not found");

  if (currentUser.role !== "ADMIN" && template.ownerId !== currentUser.id) {
    throw new Error("Unauthorized: Only template owner or admin can reorder questions");
  }

  // 5️⃣ Validate: Unique Order Values
  const orders = orderedQuestions.map(q => q.order);
  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    throw new Error("Duplicate order values found");
  }

  // 6️⃣ Batch Update Orders
  await batchUpdateQuestionOrders(orderedQuestions, templateId);

  return { message: "Questions reordered successfully" };
};