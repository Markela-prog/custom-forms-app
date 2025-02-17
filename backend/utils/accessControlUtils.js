// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

/**
 * Generic function to check access for templates, forms, questions
 */
export const checkAccess = async ({
  resource,
  resourceId,
  user,
  resourceAccessHandler = null,
  checkOwnership = false,
}) => {
  try {
    // 🟡 Handle Question Access via Template ID
    if (resource === "question" && !resourceId) {
      return { access: false, reason: "Template ID is required" };
    }

    // 🟡 Validate Resource ID
    if (!resourceId) {
      return { access: false, reason: `${resource} ID is required` };
    }

    // 🟡 1️⃣ Fetch Resource (Template if Question)
    const resourceData = await prisma[
      resource === "question" ? "template" : resource
    ].findUnique({
      where: { id: resourceId },
      include:
        resource === "template" ? { accessControl: true } : { template: true },
    });

    if (!resourceData) {
      return { access: false, reason: `${resource} not found` };
    }

    // 🟠 2️⃣ ADMIN Access
    if (user?.role === "ADMIN") {
      return { access: true, resource: resourceData };
    }

    // 🟡 3️⃣ OWNER Access
    if (resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }

    // 🟡 4️⃣ Apply Custom Logic
    if (resourceAccessHandler) {
      const overrideResult = await resourceAccessHandler({
        resourceData,
        user,
        accessLevel: checkOwnership ? "owner" : "read",
      });
      if (overrideResult !== null) {
        return overrideResult;
      }
    }

    // 🟡 5️⃣ Template ACL Check
    if (resource !== "template" && resourceData.template) {
      const templateAccess = await checkAccess({
        resource: "template",
        resourceId: resourceData.template.id,
        user,
      });
      if (!templateAccess.access) {
        return {
          access: false,
          reason: `No access to ${resource} via template`,
        };
      }
    }

    // 🚫 Default Deny
    return {
      access: false,
      reason: user
        ? `Unauthorized to access this ${resource}`
        : `Login required to access this ${resource}`,
    };
  } catch (error) {
    console.error(`Error checking ${resource} access:`, error);
    return { access: false, reason: "Internal server error" };
  }
};
