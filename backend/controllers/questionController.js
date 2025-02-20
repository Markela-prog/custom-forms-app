import {
  createQuestionService,
  getQuestionsByTemplateService,
  updateQuestionService,
  deleteQuestionService,
  reorderQuestionsService,
} from "../services/questionService.js";
import {
  getQuestionsByTemplateId,
  getQuestionsByIds,
} from "../repositories/questionRepository.js";

export const createQuestionsController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { questions } = req.body; // Expecting an array of questions

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const createdQuestions = await createQuestionsService(templateId, questions);

    res.status(201).json(createdQuestions);
  } catch (error) {
    console.error("Error creating questions:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getQuestionsByTemplateController = async (req, res) => {
  try {
    const { templateId } = req.params;
    if (!templateId) {
      return res.status(400).json({ message: "Template ID is required" });
    }

    const questions = await getQuestionsByTemplateService(templateId);
    res.json(questions);
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(404).json({ message: error.message });
  }
};

export const updateQuestionController = async (req, res) => {
  try {
    const question = await updateQuestionService(
      req.params.questionId,
      req.body
    );
    res.json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteQuestionController = async (req, res) => {
  try {
    await deleteQuestionService(req.params.questionId);
    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reorderQuestionsController = async (req, res) => {
  try {
    const { questions, templateId } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    if (!templateId) {
      return res.status(400).json({
        message: "Template ID is required for reorder",
      });
    }

    // 🟠 Validate Questions from Repository
    const dbQuestions = await getQuestionsByIds(questions.map((q) => q.id));
    if (dbQuestions.length !== questions.length) {
      return res.status(400).json({
        message: "Some provided questions do not exist",
      });
    }

    // 🟠 Validate Single Template Ownership
    const sameTemplate = dbQuestions.every((q) => q.templateId === templateId);
    if (!sameTemplate) {
      return res.status(400).json({
        message: "All provided questions must belong to the same template",
      });
    }

    // 🟠 Ensure All Questions of Template Are Provided
    const allTemplateQuestions = await getQuestionsByTemplateId(templateId);
    const allQuestionIds = allTemplateQuestions.map((q) => q.id);
    const providedIds = questions.map((q) => q.id);

    if (!areAllQuestionsProvided(allQuestionIds, providedIds)) {
      return res.status(400).json({
        message: "Not all questions of the template were provided",
      });
    }

    // 🟠 Perform Reorder
    const result = await reorderQuestionsService(questions, templateId);
    res.status(200).json(result);
  } catch (error) {
    console.error(
      "❌ [Controller] Error in reorderQuestionsController:",
      error
    );
    res.status(400).json({ message: error.message });
  }
};

// ✅ Utility Function: Ensure All Questions Are Provided
const areAllQuestionsProvided = (allQuestionIds, providedIds) => {
  return (
    allQuestionIds.length === providedIds.length &&
    allQuestionIds.every((id) => providedIds.includes(id))
  );
};
