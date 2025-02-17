export const handleTemplateAccess = async ({ resourceData, user, accessLevel }) => {
  // 🟡 1️⃣ READ Access: Public Templates
  if (accessLevel === "read" && resourceData.isPublic) {
    return { access: true, resource: resourceData };
  }

  // 🟠 2️⃣ WRITE/DELETE Access: Owner/Admin Only
  if (["write", "owner"].includes(accessLevel)) {
    if (user?.role === "ADMIN" || resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }
    return { access: false, reason: "Only the owner or admin can modify this template" };
  }

  // 🟡 3️⃣ Deny ACL Users for Write/Delete
  if (resourceData.accessControl?.some((ac) => ac.userId === user?.id)) {
    return {
      access: false,
      reason: "Access Control (ACL) users cannot edit or delete templates",
    };
  }

  return { access: false, reason: "Unauthorized template access" };
};