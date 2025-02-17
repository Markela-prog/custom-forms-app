// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import { handleTemplateAccess } from "./templateAccessHandler.js";
import { handleQuestionAccess } from "./questionAccessHandler.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - 'template', 'form', 'question'
 * @param {string} accessLevel - 'read', 'owner', 'admin'
 */
export const checkResourceAccess =
  (resourceType, accessLevel) => async (req, res, next) => {
    // 🟡 Handle Question Access via Template ID
    let resourceId;

    if (resourceType === "question") {
      // Use `templateId` from route params when accessing questions
      resourceId = req.params.templateId;
    } else {
      // Standard logic for other resources
      resourceId = req.params[`${resourceType}Id`] || req.params.id;
    }

    // Log resource ID for debugging
    console.log(`[ResourceAccess] ${resourceType} Resource ID:`, resourceId);

    if (!resourceId) {
      return res.status(400).json({ message: `Missing ${resourceType} ID` });
    }

    const user = req.user;

    // 🟠 Select Handler Based on Resource Type
    let resourceHandler = null;
    if (resourceType === "template") {
      resourceHandler = handleTemplateAccess;
    } else if (resourceType === "question") {
      resourceHandler = handleQuestionAccess;
    }

    // ✅ Perform Access Check
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
