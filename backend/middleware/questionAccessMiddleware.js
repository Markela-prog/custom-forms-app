// src/middleware/questionAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import prisma from "../prisma/prismaClient.js";

// ✅ Check Access for Viewing Questions
export const checkQuestionAccess = async (req, res, next) => {
  const { templateId } = req.params;
  const user = req.user;

  const { access, reason } = await checkAccess({
    resource: "template",
    resourceId: templateId,
    user,
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  next();
};

// ✅ Check Owner or Admin for Question Modifications
export const checkQuestionOwnerOrAdmin = async (req, res, next) => {
  try {
    const { questionId } = req.params;
    const user = req.user;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { template: true },
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // ✅ Only Template Owner or Admin can modify
    if (user.role !== "ADMIN" && question.template.ownerId !== user.id) {
      return res.status(403).json({
        message:
          "Unauthorized: Only template owner or admin can modify questions",
      });
    }

    next();
  } catch (error) {
    console.error("Question Owner Check Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkReorderPermission = async (req, res, next) => {
  try {
    const { questions } = req.body;
    const user = req.user;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid input format: No questions provided" });
    }
    
    const questionIds = questions.map((q) => q.id);
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { template: true },
    });

    if (dbQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Invalid questions: Some questions not found" });
    }
    const templateIds = new Set(dbQuestions.map((q) => q.templateId));
    if (templateIds.size !== 1) {
      return res.status(400).json({ message: "All questions must belong to the same template" });
    }

    const template = dbQuestions[0].template;

    if (user.role !== "ADMIN" && template.ownerId !== user.id) {
      return res.status(403).json({
        message: "Unauthorized: Only template owner or admin can reorder questions",
      });
    }

    next();
  } catch (error) {
    console.error("Question Reorder Permission Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
