// src/middleware/accessControlMiddleware.js

import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";

export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user || null;
  let resourceId =
    req.params.templateId ||
    req.params.formId ||
    req.params.questionId ||
    req.params.id;

  const actionsWithoutResourceId = [
    "create",
    "read_all",
    "getUserForms",
    "reorder",
  ];
  if (actionsWithoutResourceId.includes(action)) {
    resourceId = null;
  }

  console.log(
    `[AccessControl] User ${user?.id || "Guest"} - Role: ${role} - AllowedRoles: ${allowedRoles.join(",")}`
  );

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

  // 📌 Add `read_private` Fallback for Auth Users
  if (!access && ["read"].includes(action)) {
    const { access: privateAccess, role: privateRole } = await checkAccess({
      resource,
      resourceId,
      user,
      action: "read_private",
    });

    if (
      privateAccess &&
      permissionsMatrix[resource]?.["read_private"]?.includes(privateRole)
    ) {
      return next();
    }
  }

  if (access && allowedRoles.includes(role)) {
    return next();
  }

  console.error(`Access Denied for ${user?.id || "Guest"}: ${reason}`);
  res.status(403).json({ message: reason || "Access denied" });
};
