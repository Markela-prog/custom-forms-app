// src/services/answersService.js
import { createForm } from "../repositories/formRepository.js";
import { submitAnswersAndFinalize } from "../repositories/answerRepository.js";
import { getQuestionIdsByTemplate } from "../repositories/questionRepository.js";
import { checkAccess } from "../utils/accessControlUtils.js";

export const submitAnswersService = async ({ templateId, userId, answers }) => {
  // 🛡️ 1. Access Check: Based on TEMPLATE
  const access = await checkAccess({
    resource: "template",
    resourceId: templateId,
    user: { id: userId },
    action: "read",
  });

  if (!access.access) {
    throw new Error(`Access denied: ${access.reason}`);
  }

  // 🚨 2. Validate Questions Belong to Template
  const validQuestionIds = await getQuestionIdsByTemplate(templateId);
  const providedQuestionIds = new Set(answers.map((a) => a.questionId));

  const invalidQuestions = Array.from(providedQuestionIds).filter(
    (questionId) => !validQuestionIds.includes(questionId)
  );

  if (invalidQuestions.length > 0) {
    throw new Error(
      `The following questions do not belong to the template: ${invalidQuestions.join(
        ", "
      )}`
    );
  }

  // ⚙️ 3. Create a NEW Form
  const form = await createForm(templateId, userId, false);

  // 🚩 4. Validate Required Questions
  const requiredQuestions = await getQuestionIdsByTemplate(templateId, true);
  const missingQuestions = requiredQuestions.filter(
    (q) => !providedQuestionIds.has(q)
  );

  if (missingQuestions.length > 0) {
    throw new Error(
      `Missing required answers for questions: ${missingQuestions.join(", ")}`
    );
  }

  // ✅ 5. Submit Answers and Finalize
  const submissionResult = await submitAnswersAndFinalize(form.id, answers);

  return {
    message: "Answers submitted and form finalized successfully",
    form: form, // Return form details
    answers: submissionResult.answersCount,
  };
};
