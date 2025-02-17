// src/utils/accessControlUtils.js

export const checkAccess = async ({ resource, resourceId, user, action }) => {
  if (!resourceId) {
    if (["create", "read_all", "getUserForms"].includes(action)) {
      return user
        ? { access: true, role: "authenticated" }
        : { access: false, reason: "Unauthorized" };
    }
    return { access: false, reason: "Resource ID is required" };
  }

  console.log(
    `[AccessControl] User ${user?.id || "Guest"} attempting ${action} on ${resource} ${resourceId}`
  );

  const resourceData = await prisma[resource].findUnique({
    where: { id: resourceId },
    include:
      resource === "template"
        ? { accessControl: true }
        : { template: true, accessControl: true },
  });

  if (!resourceData) return { access: false, reason: `${resource} not found` };

  // 🟡 Role Checks
  if (user?.role === "ADMIN") return { access: true, role: "admin" };
  if (resourceData.ownerId === user?.id) return { access: true, role: "owner" };
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return { access: true, role: "acl" };
  }

  // 🟢 Public Check (Authenticated users can view public templates)
  if (user && resourceData.isPublic) {
    return { access: true, role: "authenticated" };
  }

  // 🟠 Public Check (Non-authenticated users)
  if (!user && resourceData.isPublic && action === "read") {
    return { access: true, role: "any" };
  }

  return { access: false, reason: "Unauthorized" };
};
