// src/middleware/templateAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";

// ✅ Check Access for Viewing Template
export const checkTemplateAccess = async (req, res, next) => {
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

// ✅ Check Owner or Admin for Template Modifications
export const checkTemplateOwnerOrAdmin = async (req, res, next) => {
  const { templateId } = req.params;
  const user = req.user;

  const { access, reason } = await checkAccess({
    resource: "template",
    resourceId: templateId,
    user,
    checkOwnership: true,
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  next();
};
