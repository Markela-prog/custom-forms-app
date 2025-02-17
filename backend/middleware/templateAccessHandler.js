// src/middleware/templateAccessHandler.js
export const handleTemplateAccess = async ({ resourceData, user, accessLevel }) => {
  // 🟡 1️⃣ Public Template (Read-Only)
  if (accessLevel === "read" && resourceData.isPublic) {
    return { access: true, resource: resourceData };
  }

  // 🟠 2️⃣ WRITE/DELETE Access (Only Owner or Admin)
  if (["write", "owner"].includes(accessLevel)) {
    if (user?.role === "ADMIN" || resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }
    return { access: false, reason: "Only the template owner or admin can modify this template" };
  }

  // 🟡 3️⃣ ACL Users Cannot Modify
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return {
      access: false,
      reason: "ACL users cannot edit or delete templates",
    };
  }

  return { access: false, reason: "Unauthorized template access" };
};
