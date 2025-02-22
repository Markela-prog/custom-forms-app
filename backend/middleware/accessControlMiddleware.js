import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import { checkAccess } from "../utils/accessControlUtils.js";
import { getResourceId } from "../utils/getResourceId.js";

export const accessControl = (resource, action) => async (req, res, next) => {
  const user = req.user || null;

  console.log(`[AccessControl] Request URL: ${req.originalUrl}`);
  console.log(`[AccessControl] Request Params:`, req.params);
  console.log(`[AccessControl] Request Body:`, req.body);

  const resourceId = getResourceId(resource, action, req);
  console.log(`[AccessControl] Derived Resource ID: ${resourceId || "no-id"}`);

  const allowedRoles = permissionsMatrix[resource]?.[action] || [];
  if (!allowedRoles.length) {
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
    templateId: req.body.templateId,
    questions: action === "update" ? req.body.questions || [] : [],
    questionIds:
      action === "delete"
        ? req.body.questionIds || []
        : req.body.questions?.map((q) => q.id) || [],
  });

  console.log(
    `[AccessControl] Result -> Access: ${access}, Role: ${user?.role}, Reason: ${reason}`
  );

  if (access && allowedRoles.includes(role)) {
    return next();
  }

  console.error(`Access Denied for ${user?.id || "Guest"}: ${reason}`);
  return res.status(403).json({ message: reason || "Access denied" });
};
