// src/middleware/templateAccessHandler.js

export const handleTemplateAccess = async ({
  resourceData,
  user,
  accessLevel,
}) => {
  // 🟡 1️⃣ Public Template (Read-Only)
  if (accessLevel === "read" && resourceData.isPublic) {
    return { access: true, resource: resourceData };
  }

  // 🟠 2️⃣ Owner or Admin (Full Access)
  if (["write", "owner"].includes(accessLevel)) {
    if (user?.role === "ADMIN" || resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }
    return {
      access: false,
      reason: "Only the template owner or admin can modify this template",
    };
  }

  // 🟡 3️⃣ ACL Users (Read Only, No Modify)
  if (
    accessLevel === "read" &&
    resourceData.accessControl?.some((ac) => ac.userId === user?.id)
  ) {
    return { access: true, resource: resourceData };
  }

  // 🚫 4️⃣ Default: No Access
  return { access: false, reason: "Unauthorized template access" };
};
