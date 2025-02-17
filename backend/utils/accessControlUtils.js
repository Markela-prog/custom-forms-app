// src/utils/accessControlUtils.js
import prisma from "../prisma/prismaClient.js";

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  if (!resourceId) return { access: false, reason: "Resource ID is required" };

  // 🟠 1️⃣ Fetch Resource
  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include: { template: true, accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  // 🟡 2️⃣ Role-Based Access
  if (user?.role === "ADMIN") return { access: true, role: "admin" };
  if (resourceData.ownerId === user?.id) return { access: true, role: "owner" };

  // 🟡 3️⃣ ACL Check
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return { access: true, role: "acl" };
  }

  // 🟠 4️⃣ Template-Specific Logic for `manage_access`
  if (resource === "template" && action === "manage_access") {
    if (resourceData.ownerId === user?.id) {
      return { access: true, role: "owner" };
    } else {
      return { access: false, reason: "Only the owner can manage access" };
    }
  }

  // 🟡 5️⃣ Template Owner Check (for forms/questions)
  if (
    (resource === "question" || resource === "form") &&
    resourceData.template?.ownerId === user?.id
  ) {
    return { access: true, role: "template_owner" };
  }

  // 🟢 6️⃣ Authenticated Check
  if (user) return { access: true, role: "authenticated" };

  // 🟠 7️⃣ Public Check (Read Only)
  if (action === "read" && resourceData.isPublic) {
    return { access: true, role: "any" };
  }

  return { access: false, reason: "Unauthorized" };
};
