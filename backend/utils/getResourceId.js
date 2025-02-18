// src/utils/getResourceId.js
export const getResourceId = (resource, action, req) => {
  if (resource === "question" && action === "reorder") {
    return req.body.templateId || null;
  }

  if (resource === "question") {
    return req.params.templateId || req.params.questionId || null;
  }

  if (resource === "template") {
    return req.params.templateId || null;
  }

  if (resource === "form") {
    return req.params.formId || null;
  }

  return req.params.id || null;
};
