// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import { handleTemplateAccess } from "./templateAccessHandler.js";
import { handleQuestionAccess } from "./questionAccessHandler.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - 'template', 'form', 'question'
 * @param {string} accessLevel - 'read', 'owner', 'admin'
 */
export const checkResourceAccess = (resourceType, accessLevel) => async (req, res, next) => {
  // 🟡 For Questions: Use `templateId`
  const resourceId = 
    resourceType === "question" 
      ? req.params.templateId 
      : req.params[`${resourceType}Id`] || req.params.id;

  if (!resourceId) {
    return res.status(400).json({ message: `Missing ${resourceType} ID` });
  }

  const user = req.user;

  // 🟠 Select Specific Handler
  let resourceHandler = null;
  if (resourceType === "template") {
    resourceHandler = handleTemplateAccess;
  } else if (resourceType === "question") {
    resourceHandler = handleQuestionAccess;
  }

  // ✅ Perform Access Check (Bypass `question` and check `template` instead)
  const { access, reason } = await checkAccess({
    resource: resourceType === "question" ? "template" : resourceType,
    resourceId,
    user,
    resourceAccessHandler: resourceHandler,
    checkOwnership: accessLevel === "owner" || accessLevel === "admin",
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  next();
};
