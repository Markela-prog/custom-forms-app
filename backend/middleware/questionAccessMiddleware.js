import { checkAccess } from "../utils/accessControlUtils.js";
import prisma from "../prisma/prismaClient.js";

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

    if (user.role !== "ADMIN" && question.template.ownerId !== user.id) {
      return res.status(403).json({
        message:
          "Unauthorized: Only template owner or admin can modify questions",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkReorderOwnership = async (req, res, next) => {
  try {
    const { questions } = req.body;
    const user = req.user;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid input: No questions provided" });
    }

    // 1️⃣ Fetch Questions from DB
    const questionIds = questions.map((q) => q.id);
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, templateId: true },
    });

    if (dbQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Some questions do not exist" });
    }

    // 2️⃣ Validate All Questions Belong to the Same Template
    const templateId = dbQuestions[0].templateId;
    const uniqueTemplateCheck = dbQuestions.every(
      (q) => q.templateId === templateId
    );
    if (!uniqueTemplateCheck) {
      return res
        .status(400)
        .json({ message: "All questions must belong to the same template" });
    }

    // 3️⃣ Fetch Template for Ownership Check
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: { ownerId: true },
    });

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // 4️⃣ Check Ownership or Admin Privileges
    if (user.role !== "ADMIN" && template.ownerId !== user.id) {
      return res.status(403).json({
        message:
          "Unauthorized: Only template owner or admin can reorder questions",
      });
    }

    // ✅ Pass Template ID for Service Layer if needed
    req.templateId = templateId;

    next();
  } catch (error) {
    console.error("❌ [Middleware] Error in checkReorderOwnership:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
