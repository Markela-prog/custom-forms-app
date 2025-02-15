// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";
import prisma from "../prisma/prismaClient.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - 'template', 'form', 'question'
 * @param {string} accessLevel - 'read', 'write', 'owner', 'admin'
 */
export const checkResourceAccess = (resourceType, accessLevel) => async (req, res, next) => {
  const resourceId = req.params[`${resourceType}Id`] || req.params.id; // e.g., templateId, formId
  const user = req.user;

  // ✅ 1️⃣ Check Resource Existence and Ownership via `checkAccess` Utility
  const { access, reason, resource } = await checkAccess({
    resource: resourceType,
    resourceId,
    user,
    checkOwnership: accessLevel === "owner" || accessLevel === "admin",
  });

  if (!access) {
    return res.status(403).json({ message: reason });
  }

  // ✅ 2️⃣ Additional Role-Specific Restrictions
  if (accessLevel === "admin" && user.role !== "ADMIN") {
    return res.status(403).json({ message: "Only admin can access this resource" });
  }

  // ✅ 3️⃣ Template Owner Check (For forms/questions under templates)
  if (["form", "question"].includes(resourceType) && accessLevel === "owner") {
    if (resource.template?.ownerId !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only template owner or admin can access" });
    }
  }

  // ✅ 4️⃣ User Form Access (For form routes)
  if (resourceType === "form" && accessLevel === "read") {
    const isUserForm = resource.userId === user.id;
    const isTemplateOwner = resource.template?.ownerId === user.id;
    if (!isUserForm && !isTemplateOwner && user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to access this form" });
    }
  }

  // ✅ Pass resource to the request if needed
  req.resource = resource;
  next();
};
