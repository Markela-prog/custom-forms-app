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
  const { questionId } = req.params;
  const user = req.user;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { template: true },
  });

  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const { access, reason } = await checkAccess({
    resource: "template",
    resourceId: question.template.id,
    user,
    checkOwnership: true,
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  next();
};
