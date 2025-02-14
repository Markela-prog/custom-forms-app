import {
  createQuestionService,
  getQuestionsByTemplateService,
  updateQuestionService,
  deleteQuestionService,
  reorderQuestionsService,
} from "../services/questionService.js";

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

// src/controllers/questionController.js
export const reorderQuestionsController = async (req, res) => {
  console.log("🟡 [Controller] Entered reorderQuestionsController");

  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      console.error("❌ [Controller] Invalid input format");
      return res.status(400).json({ message: "Invalid input format" });
    }

    const result = await reorderQuestionsService(questions, req.user);
    console.log("✅ [Controller] Reorder Result:", result);

    res.json(result);
  } catch (error) {
    console.error(
      "❌ [Controller] Error in reorderQuestionsController:",
      error.message
    );
    res.status(400).json({ message: error.message });
  }
};
