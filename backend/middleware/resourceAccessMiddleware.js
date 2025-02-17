// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import { handleTemplateAccess } from "./templateAccessHandler.js";
import { handleFormAccess } from "./formAccessHandler.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - Resource type ('template', 'form', etc.)
 * @param {string} accessLevel - Access level ('read', 'owner', 'admin')
 */
export const checkResourceAccess = (resourceType, accessLevel) => async (req, res, next) => {
  const resourceId = req.params[`${resourceType}Id`] || req.params.id;
  const user = req.user ?? null;

  // ✅ Choose appropriate resource handler if exists
  const resourceAccessHandler = {
    template: handleTemplateAccess,
    form: handleFormAccess,
  }[resourceType] || null;

  const { access, reason, resource } = await checkAccess({
    resource: resourceType,
    resourceId,
    user,
    resourceAccessHandler, // Pass the specific handler
    checkOwnership: accessLevel === "owner" || accessLevel === "admin",
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  if (accessLevel === "admin" && user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin can access this resource" });
  }

  req.resource = resource;
  next();
};
