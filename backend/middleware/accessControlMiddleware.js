// src/middleware/accessControlMiddleware.js
import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";
import { getResourceId } from "../utils/getResourceId.js";

export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user || null;

  console.log(`[AccessControl] Request URL: ${req.originalUrl}`);
  console.log(`[AccessControl] Request Params:`, req.params);
  console.log(`[AccessControl] Request Method: ${req.method}`);
  console.log(`[AccessControl] Request Path: ${req.path}`);
  console.log(`[AccessControl] Query:`, req.query);
  console.log(`[AccessControl] Body:`, req.body);

  let resourceId = getResourceId(resource, action, req);
  console.log(`[AccessControl] Derived Resource ID: ${resourceId}`);

  const allowedRoles = permissionsMatrix[resource]?.[action] || [];
  if (!allowedRoles.length) {
    return res
      .status(500)
      .json({ message: "Invalid permissions configuration" });
  }

  // ✅ Admin Override
  if (user?.role === "ADMIN") return next();

  // 🛡️ Perform Access Check with Questions for `reorder`
  const { access, role, reason } = await checkAccess({
    resource,
    resourceId,
    user,
    action,
    questions: req.body.questions || [],
  });

  console.log(
    `[AccessControl] Result -> Access: ${access}, Role: ${role}, Reason: ${reason}`
  );

  if (access && allowedRoles.includes(role)) {
    console.log(
      `[AccessControl] ✅ Access GRANTED for User: ${user?.id}, Role: ${role}`
    );
    return next();
  }

  console.error(`Access Denied for ${user?.id || "Guest"}: ${reason}`);
  res.status(403).json({ message: reason || "Access denied" });
};
