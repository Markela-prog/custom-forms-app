
import prisma from "../prisma/prismaClient.js";

// ✅ Unified Permission Middleware for All Question Routes
export const checkQuestionPermission = ({ modify = false } = {}) => async (req, res, next) => {
  try {
    const { templateId, questionId } = { ...req.params, ...req.body };
    const user = req.user;

    // 🟡 Fetch Template via Question or Template ID
    let template;
    if (questionId) {
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { template: true },
      });
      if (!question) return res.status(404).json({ message: "Question not found" });
      template = question.template;
    } else if (templateId) {
      template = await prisma.template.findUnique({
        where: { id: templateId },
        select: { id: true, ownerId: true, isPublic: true },
      });
      if (!template) return res.status(404).json({ message: "Template not found" });
    } else {
      return res.status(400).json({ message: "Template or Question ID required" });
    }

    // ✅ Permission Check:
    const isOwner = template.ownerId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (modify) {
      // 🚫 Only Owner or Admin can Modify (Create, Update, Delete, Reorder)
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: "Unauthorized: Only template owner or admin can modify questions" });
      }
    } else {
      // 🚫 For View Only: Public Template or Access-Control Check
      if (!template.isPublic && !isOwner && !isAdmin) {
        const hasAccess = await prisma.accessControl.findFirst({
          where: { templateId: template.id, userId: user.id },
        });
        if (!hasAccess) {
          return res.status(403).json({ message: "Unauthorized: No access to this template's questions" });
        }
      }
    }

    // ✅ Permission Granted
    next();
  } catch (error) {
    console.error("❌ [Middleware] Error in checkQuestionPermission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
