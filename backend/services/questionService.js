import {
  createQuestion,
  getQuestionsByTemplateId,
  updateQuestion,
  deleteQuestion,
  getQuestionsByIds,
  batchUpdateQuestionOrders,
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

export const reorderQuestionsService = async (
  orderedQuestions,
  currentUser
) => {
  console.log("🟡 [Service] Starting reorderQuestionsService...");

  const questionIds = orderedQuestions.map((q) => q.id);
  console.log("📌 [Service] Requested Question IDs:", questionIds);

  // 1️⃣ Get All Questions by IDs
  const dbQuestions = await getQuestionsByIds(questionIds);
  console.log("📌 [Service] DB Questions Found:", dbQuestions);

  // 2️⃣ Validate: All Questions Exist
  if (dbQuestions.length !== orderedQuestions.length) {
    console.error("❌ [Error] Some questions do not exist.");
    throw new Error("Some questions do not exist");
  }

  // 3️⃣ Validate: All Questions Belong to One Template
  const templateId = dbQuestions[0]?.templateId;
  console.log("📌 [Service] Template ID from DB:", templateId);

  const uniqueTemplate = dbQuestions.every((q) => q.templateId === templateId);
  if (!uniqueTemplate) {
    console.error("❌ [Error] Questions belong to different templates.");
    throw new Error("All questions must belong to the same template");
  }

  // 4️⃣ Validate: Template Ownership or Admin
  const template = await getTemplateOwnership(templateId);
  console.log("📌 [Service] Template Ownership Result:", template);

  if (!template) {
    console.error("❌ [Error] Template not found.");
    throw new Error("Template not found");
  }

  if (currentUser.role !== "ADMIN" && template.ownerId !== currentUser.id) {
    console.error(
      "❌ [Error] Unauthorized reorder attempt. User ID:",
      currentUser.id,
      " | Template Owner ID:",
      template.ownerId
    );
    throw new Error(
      "Unauthorized: Only template owner or admin can reorder questions"
    );
  }

  // 5️⃣ Validate: Unique Order Values
  const orders = orderedQuestions.map((q) => q.order);
  console.log("📌 [Service] Orders Provided:", orders);

  const uniqueOrders = new Set(orders);
  if (uniqueOrders.size !== orders.length) {
    console.error("❌ [Error] Duplicate order values found.");
    throw new Error("Duplicate order values found");
  }

  // 6️⃣ Batch Update Orders
  console.log("🟡 [Service] Updating Question Orders...");
  await batchUpdateQuestionOrders(orderedQuestions, templateId);
  console.log("✅ [Service] Questions reordered successfully!");

  return { message: "Questions reordered successfully" };
};
