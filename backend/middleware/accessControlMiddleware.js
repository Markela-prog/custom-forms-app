// src/middleware/accessControlMiddleware.js
import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";
import { getResourceId } from "../utils/getResourceId.js";

export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user || null;
  const resourceId = getResourceId(resource, action, req);

  console.log(
    `[AccessControl] Checking ${resource}:${action} for ${user?.id || "Guest"}`
  );

  const allowedRoles = permissionsMatrix[resource]?.[action] || [];
  if (!allowedRoles.length) {
    return res
      .status(500)
      .json({ message: "Invalid permissions configuration" });
  }

  const { access, reason } = await checkAccess({
    resource,
    resourceId,
    user,
    action,
  });

  if (access) {
    return next();
  }

  return res.status(403).json({ message: reason || "Access denied" });
};
