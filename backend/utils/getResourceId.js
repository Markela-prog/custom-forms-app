// src/utils/getResourceId.js
export const getResourceId = (resource, action, req) => {
  if (resource === "question") {
    if (action === "reorder") {
      // 🟠 Extract templateId from the first question provided in the body
      return req.body.questions?.[0]?.templateId || null;
    }
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
