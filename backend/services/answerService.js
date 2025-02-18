//src/services/answersService.js
import {
  createForm,
  getFormsByUserAndTemplate,
} from "../repositories/formRepository.js";
import { submitAnswersAndFinalize, getAnswerWithQuestion, updateAnswer, deleteAnswer } from "../repositories/answerRepository.js";
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



// ✅ Update Answer Service
export const updateAnswerService = async (formId, answerId, value, user) => {
  // 1. Validate Answer Format
  if (typeof value !== "string") {
    throw new Error("Answer value must be a string");
  }

  // 2. Get Answer and Validate Required Constraints
  const answer = await getAnswerWithQuestion(formId, answerId);
  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.question.isRequired && value.trim() === "") {
    throw new Error("Cannot update answer to empty string for a required question");
  }

  // 3. Perform Access Check
  const access = await checkAccess({
    resource: "answer",
    resourceId: formId,
    user,
    action: "update",
  });
  if (!access.access) {
    throw new Error(access.reason || "Access denied");
  }

  // 4. Update Answer
  return updateAnswer(formId, answerId, value);
};

// ✅ Delete Answer Service
export const deleteAnswerService = async (formId, answerId, user) => {
  // 1. Get Answer and Validate Constraints
  const answer = await getAnswerWithQuestion(formId, answerId);
  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.question.isRequired) {
    throw new Error("Cannot delete answer for a required question");
  }

  // 2. Perform Access Check
  const access = await checkAccess({
    resource: "answer",
    resourceId: formId,
    user,
    action: "delete",
  });
  if (!access.access) {
    throw new Error(access.reason || "Access denied");
  }

  // 3. Delete Answer
  return deleteAnswer(formId, answerId);
};
