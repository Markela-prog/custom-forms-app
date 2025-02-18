// src/utils/getResourceId.js
export const getResourceId = (resource, action, req) => {
  if (resource === "question" && action === "reorder") {
    // ✅ Use `templateId` from body instead of `questions[0].templateId`
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
