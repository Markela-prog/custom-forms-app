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
    const user = req.user;
  
    const { access, reason, resource } = await checkAccess({
      resource: resourceType,
      resourceId,
      user,
      checkOwnership: accessLevel === "owner" || accessLevel === "admin",
    });
  
    if (!access) {
      return res.status(403).json({ message: reason });
    }
  
    // ✅ Template Owner Check
    if (resourceType === "template" && accessLevel === "owner") {
      if (resource.ownerId !== user.id && user.role !== "ADMIN") {
        return res.status(403).json({ message: "Only the owner or admin can modify this template" });
      }
    }
  
    req.resource = resource;
    next();
  };