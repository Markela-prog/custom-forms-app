// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import { checkAccess } from "../utils/accessControlUtils.js";
import { handleTemplateAccess } from "./templateAccessHandler.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - 'template', 'form', 'question'
 * @param {string} accessLevel - 'read', 'owner', 'admin'
 */
export const checkResourceAccess = (resourceType, accessLevel) => async (req, res, next) => {
  const resourceId = req.params[`${resourceType}Id`] || req.params.id;
  const user = req.user;

  // 🟡 1️⃣ Select Handler Based on Resource
  const resourceHandler = resourceType === "template" ? handleTemplateAccess : null;

  // ✅ 2️⃣ Perform Access Check
  const { access, reason, resource } = await checkAccess({
    resource: resourceType,
    resourceId,
    user,
    resourceAccessHandler: resourceHandler, // Inject handler for templates
    checkOwnership: accessLevel === "owner" || accessLevel === "admin",
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  req.resource = resource;
  next();
};
