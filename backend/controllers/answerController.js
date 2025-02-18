import { submitAnswersService } from "../services/answerService.js";
import prisma from "../prisma/prismaClient.js";

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

    // 🚨 1. Validate Answer Format
    if (typeof value !== "string") {
      return res.status(400).json({ message: "Answer value must be a string" });
    }

    // 🚨 2. Check if Question is Required
    const answer = await prisma.answer.findUnique({
      where: { id: answerId, formId },
      include: { question: true },
    });

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.question.isRequired && value.trim() === "") {
      return res.status(400).json({
        message: "Cannot update answer to empty string for a required question",
      });
    }

    // 🛡️ 3. Perform Access Check
    const access = await checkAccess({
      resource: "answer",
      resourceId: formId,
      user: req.user,
      action: "update",
    });

    if (!access.access) {
      return res.status(403).json({ message: access.reason });
    }

    // ✅ 4. Update Answer
    const updatedAnswer = await prisma.answer.update({
      where: { id: answerId },
      data: { value },
    });

    res.status(200).json(updatedAnswer);
  } catch (error) {
    console.error("❌ [Update Answer] Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Delete Answer Controller
export const deleteAnswerController = async (req, res) => {
  try {
    const { formId, answerId } = req.params;

    // 🚨 1. Check if Answer Exists
    const answer = await prisma.answer.findUnique({
      where: { id: answerId, formId },
      include: { question: true },
    });

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    // 🚨 2. Prevent Deletion for Required Questions
    if (answer.question.isRequired) {
      return res.status(400).json({
        message: "Cannot delete answer for a required question",
      });
    }

    // 🛡️ 3. Perform Access Check
    const access = await checkAccess({
      resource: "answer",
      resourceId: formId,
      user: req.user,
      action: "delete",
    });

    if (!access.access) {
      return res.status(403).json({ message: access.reason });
    }

    // ✅ 4. Delete Answer
    await prisma.answer.delete({
      where: { id: answerId },
    });

    res.status(200).json({ message: "Answer deleted successfully" });
  } catch (error) {
    console.error("❌ [Delete Answer] Error:", error);
    res.status(400).json({ message: error.message });
  }
};
