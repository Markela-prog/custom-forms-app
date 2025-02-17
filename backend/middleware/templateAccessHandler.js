export const handleTemplateAccess = async ({ resourceData, user, accessLevel }) => {
  // 🟡 1️⃣ Read Access (Check Public First)
  if (accessLevel === "read" && resourceData.isPublic) {
    return { access: true, resource: resourceData };
  }

  // 🟠 2️⃣ Modification Access (Only Owner/Admin)
  if (["write", "owner"].includes(accessLevel)) {
    if (user?.role === "ADMIN" || resourceData.ownerId === user?.id) {
      return { access: true, resource: resourceData };
    }
    return { access: false, reason: "Only owner or admin can modify this template" };
  }

  return null; // Fallback to generic handler for other operations
};