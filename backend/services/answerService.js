import { submitAnswersAndFinalize } from "../repositories/answerRepository.js";
import { getFormById } from "../repositories/formRepository.js";
import { getRequiredQuestions } from "../repositories/questionRepository.js";

export const submitAnswersService = async (formId, answers, userId) => {
  const form = await getFormById(formId);
  if (!form) throw new Error("Form not found");

  if (form.userId !== userId) {
    throw new Error("Unauthorized: You can only submit answers to your own form");
  }

  if (form.isFinalized) {
    throw new Error("Cannot submit answers: Form has been finalized");
  }

  const requiredQuestions = await getRequiredQuestions(form.templateId);
  const answeredQuestionIds = new Set(answers.map(a => a.questionId));

  const missingQuestions = requiredQuestions.filter(q => !answeredQuestionIds.has(q.id));
  if (missingQuestions.length > 0) {
    throw new Error(`Missing required answers for questions: ${missingQuestions.map(q => q.title).join(", ")}`);
  }

  const result = await submitAnswersAndFinalize(formId, answers);
  return { message: "Answers submitted and form finalized successfully", form: result };
};