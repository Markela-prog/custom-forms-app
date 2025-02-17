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
    // 🟡 1️⃣ Use `templateId` for questions, not `questionId`
    const resourceId =
      resourceType === "question"
        ? req.params.templateId // For questions: Check access via template
        : req.params[`${resourceType}Id`] || req.params.id;

    if (!resourceId) {
      return res.status(400).json({ message: `Missing ${resourceType} ID` });
    }

    const user = req.user;

    // 🟠 2️⃣ Select Appropriate Access Handler
    let resourceHandler = null;
    if (resourceType === "template") {
      resourceHandler = handleTemplateAccess;
    } else if (resourceType === "question") {
      resourceHandler = handleQuestionAccess;
    }

    // ✅ 3️⃣ Perform Access Check
    const { access, reason } = await checkAccess({
      resource: resourceType,
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
