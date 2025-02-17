// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

/**
 * Generic function to check access for templates, forms, questions
 * @param {string} resource - Resource type ('template', 'form', etc.)
 * @param {string} resourceId - Resource ID
 * @param {object} user - User object from req.user
 * @param {function|null} resourceAccessHandler - Custom logic per resource (optional)
 * @returns {object} - { access: boolean, reason: string, resource: object }
 */
export const checkAccess = async ({
  resource,
  resourceId,
  user,
  resourceAccessHandler = null,
  checkOwnership = false,
}) => {
  try {
    // 🟡 1️⃣ Fetch Resource from Database
    const resourceData = await prisma[resource].findUnique({
      where: { id: resourceId },
      include:
        resource === "template" ? { accessControl: true } : { template: true },
    });

    if (!resourceData) {
      return { access: false, reason: `${resource} not found` };
    }

    // 🟠 2️⃣ ADMIN OVERRIDE (Admin Can Always Access Everything)
    if (user?.role === "ADMIN") {
      return { access: true, resource: resourceData };
    }

    // 🟡 3️⃣ Apply Resource-Specific Logic
    if (resourceAccessHandler) {
      const overrideResult = await resourceAccessHandler({
        resourceData,
        user,
        accessLevel: checkOwnership ? "owner" : "read",
      });
      if (overrideResult !== null) {
        return overrideResult; // Return result from handler
      }
    }

    // 🟠 4️⃣ Owner or Admin (Full Access)
    if (resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }

    // 🟡 5️⃣ Template-Based Access Control (For Authenticated Users)
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

    // 🟡 6️⃣ ACL Users (Read Only)
    if (
      user &&
      resourceData.accessControl?.some((ac) => ac.userId === user.id)
    ) {
      return { access: true, resource: resourceData };
    }

    // 🚫 7️⃣ Default: No Access
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
