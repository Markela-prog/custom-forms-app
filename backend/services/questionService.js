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
  // 🟡 Validate Orders and Fetch Questions
  const questionIds = orderedQuestions.map((q) => q.id);
  const dbQuestions = await getQuestionsByIds(questionIds);
  if (dbQuestions.length !== orderedQuestions.length) {
    throw new Error("Some questions do not exist");
  }

  // 🟡 Validate Same Template
  const templateId = dbQuestions[0].templateId;
  if (!dbQuestions.every((q) => q.templateId === templateId)) {
    throw new Error("All questions must belong to the same template");
  }

  // 🟡 Fetch All Questions for Template
  const allQuestions = await getQuestionsByTemplateId(templateId);

  // 🟡 Handle Partial Reorder
  const providedIds = orderedQuestions.map((q) => q.id);
  const remainingQuestions = allQuestions.filter(
    (q) => !providedIds.includes(q.id)
  );

  // 🟡 Merge and Consecutively Order All Questions
  const combined = [...orderedQuestions, ...remainingQuestions].map(
    (q, index) => ({
      id: q.id,
      order: index,
    })
  );

  // 🟡 Batch Update
  await batchUpdateQuestionOrders(combined, templateId);

  return { message: "Questions reordered successfully" };
};
