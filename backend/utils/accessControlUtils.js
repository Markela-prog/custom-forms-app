// src/utils/checkAccess.js
import { permissionsMatrix } from "../permissions/permissionsMatrix.js";
import {
  templatePolicy,
  questionPolicy,
  formPolicy,
  answerPolicy,
} from "./resourcePolicyChecker.js";

/**
 * ✅ Unified Access Checker
 */
export const checkAccess = async ({
  resource,
  resourceId,
  user,
  action,
}) => {
  console.log(`[AccessControl] Checking access for ${resource}:${action} by ${user?.id || "Guest"}`);

  // ✅ Admin Override
  if (user?.role === "ADMIN") return { access: true, role: "admin" };

  const allowedRoles = permissionsMatrix[resource]?.[action] || [];
  if (!allowedRoles.length) {
    return { access: false, reason: "Invalid permissions configuration" };
  }

  // 🟡 Delegate to the appropriate policy checker
  let policyResult;
  switch (resource) {
    case "template":
      policyResult = await templatePolicy({ resourceId, user, action });
      break;
    case "question":
      policyResult = await questionPolicy({ resourceId, user, action });
      break;
    case "form":
      policyResult = await formPolicy({ resourceId, user, action });
      break;
    case "answer":
      policyResult = await answerPolicy({ resourceId, user, action });
      break;
    default:
      return { access: false, reason: "Resource policy not implemented" };
  }

  // ✅ Compare with allowed roles from permissions matrix
  if (policyResult.access && allowedRoles.includes(policyResult.role)) {
    return policyResult;
  }

  return { access: false, reason: policyResult.reason || "Access denied" };
};
