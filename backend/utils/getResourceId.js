// src/utils/getResourceId.js
export const getResourceId = (resource, action, req) => {
  // ✅ Bypass resourceId check for template creation
  if (resource === "template" && action === "create") {
    return null;
  }

  if (resource === "templateForms" && action === "read") {
    return req.params.templateId || null; // ✅ Use templateId
  }

  if (resource === "userForms" && action === "getUserForms") {
    return req.user?.id || null; // ✅ Use current user’s ID
  }

  if (resource === "form" && ["read", "delete"].includes(action)) {
    return req.params.formId || null;  // ✅ Use formId
  }

  if (resource === "question" && action === "reorder") {
    return req.body.templateId || null;
  }

  if (resource === "question") {
    if (["create", "read"].includes(action)) {
      return req.params.templateId || null;
    }
    if (["update", "delete"].includes(action)) {
      return req.params.questionId || null;
    }
  }

  if (resource === "template") {
    return req.params.templateId || null;
  }

  if (resource === "form") {
    return req.params.formId || null;
  }

  return req.params.id || null;
};
