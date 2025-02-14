import {
  createQuestionService,
  getQuestionsByTemplateService,
  updateQuestionService,
  deleteQuestionService,
  reorderQuestionsService,
} from "../services/questionService.js";
import { getQuestionsByTemplateId } from "../repositories/questionRepository.js";

export const createQuestionController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const question = await createQuestionService(
      templateId,
      req.user.id,
      req.user.role === "ADMIN",
      req.body
    );
    res.status(201).json(question);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getQuestionsByTemplateController = async (req, res) => {
  try {
    const { templateId } = req.params;

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

// ✅ Controller: Validate Provided Questions Against Template Questions
export const reorderQuestionsController = async (req, res) => {
  try {
    const { questions } = req.body;
    const { templateId } = req.params;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    // 🟡 Fetch All Questions FROM THIS TEMPLATE ONLY
    const allTemplateQuestions = await getQuestionsByTemplateId(templateId);
    const allQuestionIds = allTemplateQuestions.map((q) => q.id);
    const providedIds = questions.map((q) => q.id);

    // 🟡 Validate: All Template Questions Were Provided
    if (!areAllQuestionsProvided(allQuestionIds, providedIds)) {
      return res.status(400).json({
        message: "Not all questions of the template were provided",
      });
    }

    // 🟡 Perform Reorder via Service
    const result = await reorderQuestionsService(questions, templateId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Utility Function: Ensure All Questions Are Provided
const areAllQuestionsProvided = (allQuestionIds, providedIds) => {
  if (allQuestionIds.length !== providedIds.length) return false;
  return allQuestionIds.every((id) => providedIds.includes(id));
};
