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
    if (!resourceId) {
      throw new Error(`No ${resource} ID provided`);
    }

    // 🟡 1️⃣ Fetch Resource from Database
    const resourceData = await prisma[resource].findUnique({
      where: { id: resourceId },
      include:
        resource === "template" ? { accessControl: true } : { template: true },
    });

    if (!resourceData) {
      return { access: false, reason: `${resource} not found` };
    }

    // 🟠 2️⃣ ADMIN OVERRIDE
    if (user?.role === "ADMIN") {
      return { access: true, resource: resourceData };
    }

    // 🟡 3️⃣ OWNER OVERRIDE
    if (resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }

    // 🟡 4️⃣ Apply Resource-Specific Logic
    if (resourceAccessHandler) {
      const overrideResult = await resourceAccessHandler({
        resourceData,
        user,
      });
      if (overrideResult !== null) {
        return overrideResult;
      }
    }

    // 🟡 5️⃣ ACL Check
    if (
      user &&
      resourceData.accessControl?.some((ac) => ac.userId === user.id)
    ) {
      return { access: true, resource: resourceData };
    }

    // 🚫 Default: No Access
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
