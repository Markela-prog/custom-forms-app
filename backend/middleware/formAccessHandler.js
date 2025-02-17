export const handleFormAccess = async ({ resourceData, user }) => {
    // Only show form to user if it’s their form or they are the template owner
    const isFormOwner = resourceData.userId === user?.id;
    const isTemplateOwner = resourceData.template?.ownerId === user?.id;
  
    if (isFormOwner || isTemplateOwner || user?.role === "ADMIN") {
      return { access: true, resource: resourceData };
    }
  
    // Otherwise, continue with standard checks
    return null;
  };