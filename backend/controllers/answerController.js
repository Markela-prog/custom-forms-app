import { submitAnswersService, updateAnswerService, deleteAnswerService } from "../services/answerService.js";

export const submitAnswersController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        message: "Invalid answers format or no answers provided",
      });
    }

    const result = await submitAnswersService({
      templateId,
      userId,
      userRole,
      answers,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("❌ [Submit Answers] Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Update Answer Controller
export const updateAnswerController = async (req, res) => {
  try {
    const { formId, answerId } = req.params;
    const { value } = req.body;
    const user = req.user;

    const updatedAnswer = await updateAnswerService(formId, answerId, value, user);
    res.status(200).json(updatedAnswer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Answer Controller
export const deleteAnswerController = async (req, res) => {
  try {
    const { formId, answerId } = req.params;
    const user = req.user;

    await deleteAnswerService(formId, answerId, user);
    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};