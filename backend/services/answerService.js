//src/services/answersService.js
import {
  createForm,
  getFormsByUserAndTemplate,
} from "../repositories/formRepository.js";
import { submitAnswersAndFinalize } from "../repositories/answerRepository.js";
import { getQuestionIdsByTemplate } from "../repositories/questionRepository.js";
import { checkAccess } from "../utils/accessControlUtils.js";

export const submitAnswersService = async ({
  templateId,
  userId,
  userRole,
  answers,
}) => {
  // 🛡️ 1. Access Check: Based on TEMPLATE
  const access = await checkAccess({
    resource: "template",
    resourceId: templateId,
    user: { id: userId, role: userRole },
    action: "read",
  });

  if (!access.access) {
    throw new Error(`Access denied: ${access.reason}`);
  }

  // 🚨 2. Prevent Duplicate Forms (Non-Admins Only)
  if (userRole !== "ADMIN") {
    const existingForm = await getFormsByUserAndTemplate(userId, templateId);
    if (existingForm) {
      throw new Error("You have already submitted answers for this template.");
    }
  }

  // 🚨 3. Validate Questions Belong to Template
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

  // ⚙️ 5. Create Form and Submit Answers
  const form = await createForm(templateId, userId, false);
  const submissionResult = await submitAnswersAndFinalize(form.id, answers);

  return {
    message: "Answers submitted and form finalized successfully",
    form: form,
    answersCount: submissionResult.answersCount,
  };
};
