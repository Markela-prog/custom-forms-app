// src/middleware/questionAccessMiddleware.js
import { checkResourceAccess } from "./resourceAccessMiddleware.js";

// ✅ Get Questions (via Template Access)
export const checkQuestionAccess = checkResourceAccess("question", "read");

// ✅ Update or Delete Questions (Only Owner/Admin)
export const checkQuestionOwnerOrAdmin = checkResourceAccess("question", "owner");


export const checkReorderOwnership = async (req, res, next) => {
  try {
    const { questions } = req.body;
    const user = req.user;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Invalid input: No questions provided" });
    }

    const questionIds = questions.map(q => q.id);
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, templateId: true },
    });

    if (dbQuestions.length !== questions.length) {
      return res.status(400).json({ message: "Some questions do not exist" });
    }

    const templateId = dbQuestions[0].templateId;
    const uniqueTemplateCheck = dbQuestions.every(q => q.templateId === templateId);
    if (!uniqueTemplateCheck) {
      return res.status(400).json({ message: "All questions must belong to the same template" });
    }

    const { access, reason } = await checkAccess({
      resource: "template",
      resourceId: templateId,
      user,
      checkOwnership: true,
    });

    if (!access) {
      return res.status(403).json({ message: reason });
    }

    req.templateId = templateId;
    next();
  } catch (error) {
    console.error("❌ [Middleware] Error in checkReorderOwnership:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};