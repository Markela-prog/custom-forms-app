// ✅ src/utils/getResourceId.js
export const getResourceId = (resource, action, req) => {
  switch (resource) {
    /** TEMPLATE CASES **/
    case "template":
        if (action === "manage_access" && !req.params.templateId) {
            return null; // This allows fetching non-admin users
          }
      return action === "create" ? null : req.params.templateId || null;

    /** TEMPLATE FORMS (New) **/
    case "templateForms":
      // Forms by template: Use templateId
      return req.params.templateId || null;

    /** USER FORMS (New) **/
    case "userForms":
      // Forms by user: Use userId from token
      return req.user?.id || null;

    case "userTemplates": // ✅ Handle fetching user's own templates
      return req.user?.id || null;

    /** FORM CASES **/
    case "form":
      // Single form actions: Use formId
      return req.params.formId || null;

    /** ANSWER CASES **/
    case "answer":
      // Use formId from params (since answers belong to forms)
      return req.params.formId || null;

    /** QUESTION CASES **/
    case "question":
      // - Reorder: Use templateId from body
      // - Create/Read: Use templateId from params
      // - Update/Delete: Use questionId from params
      if (action === "reorder") {
        return req.body.templateId || null;
      }
      if (["create", "read"].includes(action)) {
        return req.params.templateId || null;
      }
      if (["update", "delete"].includes(action)) {
        return req.body.questionIds?.[0] || null;
      }
      break;

    /** DEFAULT CASE **/
    default:
      return req.params.id || null;
  }
};
