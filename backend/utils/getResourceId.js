export const getResourceId = (resource, action, req) => {
  switch (resource) {
    case "template":
      if (action === "manage_access" && !req.params.templateId) {
        return null;
      }
      return action === "create" ? null : req.params.templateId || null;

    case "templateForms":
      return req.params.templateId || null;

    case "userForms":
      return req.user?.id || null;

    case "userTemplates":
      return req.user?.id || null;

    case "form":
      return req.params.formId || null;

    case "answer":
      return req.params.formId || null;

    case "question":
      if (action === "reorder") {
        return req.body.templateId || null;
      }
      if (["create", "read"].includes(action)) {
        return req.params.templateId || null;
      }
      if (["update"].includes(action)) {
        return req.body.questions?.[0]?.id || null;
      }

      if (["delete"].includes(action)) {
        return req.body.questionIds?.[0] || null;
      }
      break;

    default:
      return req.params.id || null;
  }
};
