// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

/**
 * Check if the user has access to a resource.
 * @param {string} resource - template, question, form, answer
 * @param {string} resourceId - ID of the resource
 * @param {object} user - User object from req.user
 * @param {string} action - Action to check (e.g., read, update, delete)
 * @returns {object} - { access: boolean, role: string, reason: string }
 */
export const checkAccess = async ({ resource, resourceId, user, action }) => {
  // 🟡 1️⃣ Handle Actions Without Resource ID
  if (!resourceId) {
    if (["create", "read_all", "getUserForms"].includes(action)) {
      return user
        ? { access: true, role: "authenticated" }
        : { access: false, reason: "Unauthorized" };
    }
    return { access: false, reason: "Resource ID is required" };
  }

  // 🟠 2️⃣ Fetch Resource Data
  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include:
      resource === "template"
        ? { accessControl: true }
        : { template: true, accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  // 🟡 3️⃣ Role-Based Access
  if (user?.role === "ADMIN") return { access: true, role: "admin" };

  // ✅ Owner Check
  if (resourceData.ownerId === user?.id) {
    return { access: true, role: "owner" };
  }

  // ✅ ACL Check
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return { access: true, role: "acl" };
  }

  // ✅ Template Owner Check (For Forms/Questions)
  if (
    (resource === "question" || resource === "form") &&
    resourceData.template?.ownerId === user?.id
  ) {
    return { access: true, role: "template_owner" };
  }

  // ✅ Authenticated User for Public Templates
  if (user && resourceData.isPublic) {
    return { access: true, role: "authenticated" };
  }

  // ✅ Public Check (Read Only)
  if (!user && resourceData.isPublic && action === "read") {
    return { access: true, role: "any" };
  }

  return { access: false, reason: "Unauthorized" };
};
