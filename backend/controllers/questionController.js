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

export const createQuestionController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const question = await createQuestionService(templateId, req.body);
    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(403).json({ message: error.message });
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
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    // 🟠 Ensure Template ID is Provided
    const templateId = questions[0]?.templateId;
    if (!templateId) {
      return res
        .status(400)
        .json({ message: "Template ID is required for reorder" });
    }

    // 🟠 Validate Questions from Repository
    const dbQuestions = await getQuestionsByIds(questions.map((q) => q.id));
    if (dbQuestions.length !== questions.length) {
      return res
        .status(400)
        .json({ message: "Some provided questions do not exist" });
    }

    // 🟠 Validate Single Template Ownership
    const sameTemplate = dbQuestions.every((q) => q.templateId === templateId);
    if (!sameTemplate) {
      return res.status(400).json({
        message: "All provided questions must belong to the same template",
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
