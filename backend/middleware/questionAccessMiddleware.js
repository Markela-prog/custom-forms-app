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

// src/middleware/questionAccessMiddleware.js
export const checkReorderPermission = async (req, res, next) => {
  console.log("🟡 [Middleware] Entered checkReorderPermission");

  try {
    const { questions } = req.body;
    const user = req.user;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      console.error("❌ [Middleware] Invalid input format in reorder");
      return res
        .status(400)
        .json({ message: "Invalid input format: No questions provided" });
    }

    const questionIds = questions.map((q) => q.id);
    console.log("📌 [Middleware] Question IDs Received:", questionIds);

    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      include: { template: true },
    });
    console.log("📌 [Middleware] DB Questions Found:", dbQuestions);

    if (dbQuestions.length !== questions.length) {
      console.error("❌ [Middleware] Some questions not found");
      return res
        .status(400)
        .json({ message: "Invalid questions: Some questions not found" });
    }

    const templateIds = new Set(dbQuestions.map((q) => q.templateId));
    console.log("📌 [Middleware] Unique Template IDs:", templateIds);

    if (templateIds.size !== 1) {
      console.error("❌ [Middleware] Multiple template IDs detected");
      return res
        .status(400)
        .json({ message: "All questions must belong to the same template" });
    }

    const template = dbQuestions[0].template;
    console.log("📌 [Middleware] Template Owner ID:", template.ownerId);
    console.log("📌 [Middleware] Current User ID:", user.id);

    if (user.role !== "ADMIN" && template.ownerId !== user.id) {
      console.error("❌ [Middleware] Unauthorized reorder attempt");
      return res.status(403).json({
        message:
          "Unauthorized: Only template owner or admin can reorder questions",
      });
    }

    console.log("✅ [Middleware] Reorder permission granted");
    next();
  } catch (error) {
    console.error(
      "❌ [Middleware] Error during reorder permission check:",
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
};
