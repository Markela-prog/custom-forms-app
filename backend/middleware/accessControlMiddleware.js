// src/middleware/accessControlMiddleware.js
import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";

export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user || null;

  console.log(`[AccessControl] Request URL: ${req.originalUrl}`);
  console.log(`[AccessControl] Request Params:`, req.params);
  console.log(`[AccessControl] Request Method: ${req.method}`);
  console.log(`[AccessControl] Request Path: ${req.path}`);
  console.log(`[AccessControl] Query:`, req.query);
  console.log(`[AccessControl] Body:`, req.body);

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

  const allowedRoles = permissionsMatrix[resource]?.[action] || [];
  if (!allowedRoles.length) {
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

  console.log(
    `[AccessControl] Result -> Access: ${access}, Role: ${role}, Reason: ${reason}`
  );

  console.log(
    `[AccessControl] User ${
      user?.id || "Guest"
    } - Role: ${role} - AllowedRoles: ${allowedRoles.join(",")}`
  );

  if (access && allowedRoles.includes(role)) {
    console.log(
      `[AccessControl] ✅ Access GRANTED for User: ${user?.id}, Role: ${role}`
    );
    return next();
  }

  // 🟡 Fallback: Check `read_private` for Authenticated Users
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

  console.error(`Access Denied for ${user?.id || "Guest"}: ${reason}`);
  res.status(403).json({ message: reason || "Access denied" });
};
