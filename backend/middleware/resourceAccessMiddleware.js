// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - 'template', 'form', 'question'
 * @param {string} accessLevel - 'read', 'owner', 'admin'
 * @param {function|null} resourceAccessHandler - Custom handler (optional)
 */
export const checkResourceAccess = (resourceType, accessLevel, resourceAccessHandler = null) => async (req, res, next) => {
  // 🟡 1️⃣ Get Resource ID Correctly
  const resourceId = 
    req.params[`${resourceType}Id`] || 
    req.params.id || 
    (resourceType === "question" ? req.params.questionId : null);

  if (!resourceId) {
    return res.status(400).json({ message: `Missing ${resourceType} ID` });
  }

  const user = req.user;

  // 🟠 2️⃣ Perform Centralized Access Check
  const { access, reason, resource } = await checkAccess({
    resource: resourceType,
    resourceId,
    user,
    resourceAccessHandler,
    checkOwnership: accessLevel === "owner" || accessLevel === "admin",
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  req.resource = resource;
  next();
};
