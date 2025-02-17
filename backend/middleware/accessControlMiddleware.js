// src/middleware/accessControlMiddleware.js
import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";

// src/middleware/accessControlMiddleware.js
export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user; // Make sure req.user is passed
  console.log("[AccessControl] Middleware received User:", user);

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

  const allowedRoles = permissionsMatrix[resource]?.[action];
  if (!allowedRoles) {
    return res
      .status(500)
      .json({ message: "Invalid permissions configuration" });
  }

  if (user?.role === "ADMIN") return next();

  const { access, role, reason } = await checkAccess({
    resource,
    resourceId,
    user,
    action,
  });

  console.log(
    `[AccessControl] User ${
      user?.id || "Guest"
    } - Role: ${role} - AllowedRoles: ${allowedRoles.join(",")}`
  );

  if (!access && action === "read") {
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
