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

export const reorderQuestionsController = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid input format" });
    }

    await reorderQuestionsService(questions);
    res.json({ message: "Questions reordered successfully" });
  } catch (error) {
    console.error("Error reordering questions:", error);
    res.status(400).json({ message: error.message });
  }
};
