// src/middleware/questionAccessHandler.js
export const handleQuestionAccess = async ({ resourceData, user, accessLevel }) => {
    // 🟡 1️⃣ Public Template Questions (Accessible to Anyone)
    if (accessLevel === "read" && resourceData.template.isPublic) {
      return { access: true, resource: resourceData };
    }
  
    // 🟠 2️⃣ Private Template: Only Authenticated Users with Access or Owner/Admin
    if (accessLevel === "read" && !resourceData.template.isPublic) {
      if (!user) {
        return { access: false, reason: "Login required to access private questions" };
      }
  
      const isOwner = resourceData.template.ownerId === user.id;
      const hasACL = resourceData.template.accessControl?.some(ac => ac.userId === user.id);
      if (isOwner || hasACL || user.role === "ADMIN") {
        return { access: true, resource: resourceData };
      }
  
      return { access: false, reason: "No access to private template questions" };
    }
  
    return null; // Fallback to default logic
  };
  