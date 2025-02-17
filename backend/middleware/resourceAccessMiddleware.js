// src/middleware/resourceAccessMiddleware.js
import { checkAccess } from "../utils/accessControlUtils.js";

/**
 * Middleware to check resource access (template, form, question)
 * @param {string} resourceType - 'template', 'form', 'question'
 * @param {string} accessLevel - 'read', 'write', 'owner', 'admin'
 */
export const checkResourceAccess =
  (resourceType, accessLevel) => async (req, res, next) => {
    const resourceId = req.params[`${resourceType}Id`] || req.params.id;
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
      return res
        .status(403)
        .json({ message: "Only admin can access this resource" });
    }

    // ✅ 3️⃣ Template-Specific Access Rules
    if (resourceType === "template") {
      if (resource.isPublic) {
        // Public Template: Visible to everyone
        return next();
      }

      // Private Template Access Rules
      const isTemplateOwner = resource.ownerId === user?.id;
      const hasAccessControl = resource.accessControl?.some(
        (ac) => ac.userId === user?.id
      );

      // Admin or Template Owner
      if (user?.role === "ADMIN" || isTemplateOwner || hasAccessControl) {
        return next();
      }

      return res.status(403).json({
        message: "No access to this private template",
      });
    }

    // ✅ 4️⃣ Form or Question-Specific Rules (Reusing for other routes)
    if (
      ["form", "question"].includes(resourceType) &&
      accessLevel === "owner"
    ) {
      if (resource.template?.ownerId !== user?.id && user.role !== "ADMIN") {
        return res.status(403).json({
          message: "Only template owner or admin can access",
        });
      }
    }

    if (resourceType === "form" && accessLevel === "read") {
      const isUserForm = resource.userId === user?.id;
      const isTemplateOwner = resource.template?.ownerId === user?.id;
      if (!isUserForm && !isTemplateOwner && user.role !== "ADMIN") {
        return res.status(403).json({
          message: "Unauthorized to access this form",
        });
      }
    }

    // ✅ Pass resource to the request if needed
    req.resource = resource;
    next();
  };
