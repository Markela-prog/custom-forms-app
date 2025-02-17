// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  if (!resourceId) {
    if (["create", "read_all", "getUserForms"].includes(action)) {
      return user ? { access: true, role: "authenticated" } : { access: false, reason: "Unauthorized" };
    }
    return { access: false, reason: "Resource ID is required" };
  }

  console.log(`[AccessControl] User ${user?.id || "Guest"} attempting ${action} on ${resource} ${resourceId}`);

  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include: { accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  if (user?.role === "ADMIN") return { access: true, role: "admin" };
  if (resourceData.ownerId === user?.id) return { access: true, role: "owner" };

  // ✅ Fix ACL Check:
  const aclUser = resourceData.accessControl?.find(ac => ac.userId === user?.id);
  if (aclUser) {
    console.log(`[AccessControl] User ${user?.id} has ACL access.`);
    return { access: true, role: "acl" };
  }

  if (user && resourceData.isPublic) return { access: true, role: "authenticated" };
  if (!user && resourceData.isPublic && action === "read") return { access: true, role: "any" };

  return { access: false, reason: "Unauthorized" };
};
