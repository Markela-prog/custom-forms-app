// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

/**
 * Generic function to check access for templates, forms, questions
 * @param {string} resource - 'template', 'form', or 'question'
 * @param {string} resourceId - The ID of the resource
 * @param {object} user - User object from req.user
 * @param {boolean} checkOwnership - If true, checks if user is owner or admin
 * @returns {object} - { access: boolean, reason: string, resource: object }
 */
export const checkAccess = async ({
  resource,
  resourceId,
  user,
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

    // 🟠 2️⃣ Admin or Owner: Full Access
    if (user.role === "ADMIN" || resourceData.ownerId === user.id) {
      return { access: true, resource: resourceData };
    }

    // 🟡 3️⃣ Template-Based Access Control
    if (resource !== "template" && resourceData.template) {
      const templateId = resourceData.template.id;
      const templateAccess = await checkAccess({
        resource: "template",
        resourceId: templateId,
        user,
      });
      if (!templateAccess.access) {
        return {
          access: false,
          reason: `No access to ${resource} via template`,
        };
      }
    }

    // 🟡 4️⃣ Resource-Specific Access-Control for Users
    if (resourceData.accessControl?.some((ac) => ac.userId === user.id)) {
      return { access: true, resource: resourceData };
    }

    // 🚫 5️⃣ Default: No Access
    return { access: false, reason: `Unauthorized to access this ${resource}` };
  } catch (error) {
    console.error(`Error checking ${resource} access:`, error);
    return { access: false, reason: "Internal server error" };
  }
};
