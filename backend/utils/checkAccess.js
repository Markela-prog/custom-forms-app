// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

/**
 * Generic function to check access for different resources (template, form, question)
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
    // Dynamically fetch resource based on type
    const resourceData = await prisma[resource].findUnique({
      where: { id: resourceId },
      include: { accessControl: true },
    });

    if (!resourceData) {
      return { access: false, reason: `${resource} not found` };
    }

    // 🟡 Public Access: Anyone can view
    if (!checkOwnership && resourceData.isPublic) {
      return { access: true, resource: resourceData };
    }

    // 🟠 Admin or Owner: Full Access
    if (
      user &&
      (resourceData.ownerId === user.id || user.role === "ADMIN")
    ) {
      return { access: true, resource: resourceData };
    }

    // 🟡 Access-Control for Private Resources
    const hasAccess = resourceData.accessControl.some(
      (access) => access.userId === user?.id
    );

    if (hasAccess) {
      return { access: true, resource: resourceData };
    }

    // 🚫 No Access
    return { access: false, reason: `Unauthorized: No access to this ${resource}` };
  } catch (error) {
    console.error(`Error checking ${resource} access:`, error);
    return { access: false, reason: "Internal server error" };
  }
};
