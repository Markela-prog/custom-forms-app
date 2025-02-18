export const getResourceId = (resource, action, req) => {
    switch (resource) {
      case "question":
        // 🟢 For `create`, `read`, `reorder`: Use `templateId`
        if (["create", "read", "reorder"].includes(action)) {
          return req.params.templateId;
        }
        // 🟢 For `update`, `delete`: Use `questionId`
        if (["update", "delete"].includes(action)) {
          return req.params.questionId;
        }
        break;
  
      case "template":
        // 🟢 For `template` actions: Use `templateId`
        return req.params.templateId;
  
      case "form":
        // 🟢 For `form` actions: Use `formId`
        return req.params.formId;
  
      default:
        // 🟡 Fallback for other resources: Use `id`
        return req.params.id;
    }
  };