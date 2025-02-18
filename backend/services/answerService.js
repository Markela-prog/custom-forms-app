import {
  createForm,
  getFormsByUserAndTemplate,
} from "../repositories/formRepository.js";
import { submitAnswersAndFinalize } from "../repositories/answerRepository.js";
import { getRequiredQuestions } from "../repositories/questionRepository.js";
import { checkAccess } from "../utils/accessControlUtils.js";

export const submitAnswersService = async ({ templateId, userId, answers }) => {
  // 🛡️ 1. Access Check (Uses current Access Control logic)
  const access = await checkAccess({
    resource: "form",
    resourceId: templateId,
    user: { id: userId },
    action: "create",
  });

  if (!access.access) {
    throw new Error(`Access denied: ${access.reason}`);
  }

  // ⚙️ 2. Create Form if Not Exists
  let form = await getFormsByUserAndTemplate(userId, templateId);
  if (!form) {
    form = await createForm(templateId, userId, false);
  }

  // 🚩 3. Validate Required Questions
  const requiredQuestions = await getRequiredQuestions(templateId);
  const answeredQuestionIds = new Set(answers.map((a) => a.questionId));
  const missingQuestions = requiredQuestions.filter(
    (q) => !answeredQuestionIds.has(q.id)
  );

  if (missingQuestions.length > 0) {
    throw new Error(
      `Missing required answers for: ${missingQuestions
        .map((q) => q.title)
        .join(", ")}`
    );
  }

  // ✅ 4. Submit Answers and Finalize
  const result = await submitAnswersAndFinalize(form.id, answers);
  return {
    message: "Answers submitted and form finalized successfully",
    formId: form.id,
  };
};
