export const handleTemplateAccess = async ({ resourceData, user }) => {
    // 1️⃣ Public Template Access for Unauthenticated Users
    if (resourceData.isPublic && !user) {
      return { access: true, resource: resourceData };
    }
  
    // 2️⃣ Authenticated Users Follow Generic Access Rules (Return null to continue default checks)
    return null;
  };