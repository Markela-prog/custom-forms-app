// src/middleware/accessControlMiddleware.js
import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";

/**
 * Unified Access Control Middleware
 * @param {string} resource - template, question, form, answer
 * @param {string} action - create, read, update, delete, reorder, manage_access, etc.
 */
export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user || null;

  // 🟡 Determine `resourceId` from route params
  let resourceId =
    req.params.templateId ||
    req.params.formId ||
    req.params.questionId ||
    req.params.id;

  // ✅ Allow actions without resource ID (e.g., create, read_all)
  const actionsWithoutResourceId = [
    "create",
    "read_all",
    "getUserForms",
    "reorder",
  ];
  if (actionsWithoutResourceId.includes(action)) {
    resourceId = null;
  }

  // 🔹 Get Allowed Roles for Action
  const allowedRoles = permissionsMatrix[resource]?.[action];
  if (!allowedRoles) {
    return res
      .status(500)
      .json({ message: "Invalid permissions configuration" });
  }

  // ✅ Admin Override
  if (user?.role === "ADMIN") return next();

  // 🛡️ Perform Access Check
  const { access, role, reason } = await checkAccess({
    resource,
    resourceId,
    user,
    action,
  });

  if (access && allowedRoles.includes(role)) {
    return next();
  }

  res.status(403).json({ message: reason || "Access denied" });
};
