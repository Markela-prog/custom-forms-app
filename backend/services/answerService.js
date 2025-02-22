import {
  createForm,
  getFormsByUserAndTemplate,
} from "../repositories/formRepository.js";
import {
  submitAnswersAndFinalize,
  getAnswerWithQuestion,
  updateAnswer,
  deleteAnswer,
} from "../repositories/answerRepository.js";
import { getQuestionIdsByTemplate } from "../repositories/questionRepository.js";
import { checkAccess } from "../utils/accessControlUtils.js";

export const submitAnswersService = async ({
  templateId,
  userId,
  userRole,
  answers,
}) => {
  const access = await checkAccess({
    resource: "template",
    resourceId: templateId,
    user: { id: userId, role: userRole },
    action: "read",
  });

  if (!access.access) {
    throw new Error(`Access denied: ${access.reason}`);
  }

  if (userRole !== "ADMIN") {
    const existingForm = await getFormsByUserAndTemplate(userId, templateId);
    if (existingForm) {
      throw new Error("You have already submitted answers for this template.");
    }
  }

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

  const requiredQuestions = await getQuestionIdsByTemplate(templateId, true);
  const missingQuestions = requiredQuestions.filter(
    (q) => !providedQuestionIds.has(q)
  );

  if (missingQuestions.length > 0) {
    throw new Error(
      `Missing required answers for questions: ${missingQuestions.join(", ")}`
    );
  }

  const form = await createForm(templateId, userId, false);
  const submissionResult = await submitAnswersAndFinalize(form.id, answers);

  return {
    message: "Answers submitted and form finalized successfully",
    form: form,
    answersCount: submissionResult.answersCount,
  };
};

export const updateAnswerService = async (formId, answerId, value, user) => {
  if (typeof value !== "string") {
    throw new Error("Answer value must be a string");
  }

  const answer = await getAnswerWithQuestion(formId, answerId);
  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.question.isRequired && value.trim() === "") {
    throw new Error(
      "Cannot update answer to empty string for a required question"
    );
  }

  const access = await checkAccess({
    resource: "answer",
    resourceId: formId,
    user,
    action: "update",
  });
  if (!access.access) {
    throw new Error(access.reason || "Access denied");
  }

  return updateAnswer(formId, answerId, value);
};

export const deleteAnswerService = async (formId, answerId, user) => {
  const answer = await getAnswerWithQuestion(formId, answerId);
  if (!answer) {
    throw new Error("Answer not found");
  }

  if (answer.question.isRequired) {
    throw new Error("Cannot delete answer for a required question");
  }

  const access = await checkAccess({
    resource: "answer",
    resourceId: formId,
    user,
    action: "delete",
  });
  if (!access.access) {
    throw new Error(access.reason || "Access denied");
  }

  return deleteAnswer(formId, answerId);
};
