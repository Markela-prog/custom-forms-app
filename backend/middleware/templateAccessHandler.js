export const handleTemplateAccess = async ({ resourceData, user }) => {
  // 1️⃣ Public Template Access: Allow for both unauthenticated and authenticated users
  if (resourceData.isPublic) {
    return { access: true, resource: resourceData };
  }

  // 2️⃣ Private Template Access: Follow Generic Access Rules (Return null for fallback)
  return null;
};