// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  if (!resourceId) return { access: false, reason: "Resource ID is required" };

  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include: { template: true, accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  // 🛡️ Role Checks
  if (user?.role === "ADMIN") return { access: true, role: "admin" };
  if (resourceData.ownerId === user?.id) return { access: true, role: "owner" };

  // 🟡 ACL Check
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return { access: true, role: "acl" };
  }

  // 🟡 Template-Specific Rules
  if (resource === "question" || resource === "form") {
    if (resourceData.template?.ownerId === user?.id) {
      return { access: true, role: "template_owner" };
    }
  }

  // 🟡 Authenticated User Check
  if (user) return { access: true, role: "authenticated" };

  // 🟠 Public Check for `read`
  if (action === "read" && resourceData.isPublic) {
    return { access: true, role: "any" };
  }

  return { access: false, reason: "Unauthorized" };
};
