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
