// src/middleware/questionAccessHandler.js
import { checkAccess } from "../utils/accessControlUtils.js";

/**
 * Custom Access Handler for Questions
 * - Uses `templateId` to check access
 */
export const handleQuestionAccess = async ({ resourceData, user, accessLevel }) => {
  // 🟠 If the user is ADMIN, allow all
  if (user?.role === "ADMIN") {
    return { access: true, resource: resourceData };
  }

  // 🟡 Check Access via Template
  const templateAccess = await checkAccess({
    resource: "template",
    resourceId: resourceData.templateId,
    user,
    checkOwnership: accessLevel === "owner",
  });

  if (templateAccess.access) {
    return { access: true, resource: resourceData };
  }

  // 🚫 Default: No Access
  return {
    access: false,
    reason: "No access to questions via template",
  };
};
