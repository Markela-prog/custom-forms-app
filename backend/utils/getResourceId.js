export const getResourceId = (resource, action, req) => {
  if (resource === "question") {
    if (action === "reorder") {
      const firstQuestion = req.body.questions?.[0];
      return firstQuestion?.templateId || null;
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
