import {
  submitAnswers,
  getAnswersByForm,
} from "../repositories/answerRepository.js";
import { getFormById } from "../repositories/formRepository.js";

export const submitAnswersService = async (formId, answers, userId) => {
  const form = await getFormById(formId);
  if (!form) throw new Error("Form not found");

  if (form.isFinalized) {
    throw new Error("Cannot submit answers: Form has been finalized");
  }

  if (form.userId !== userId) {
    throw new Error(
      "Unauthorized: You can only submit answers to your own form"
    );
  }

  return await submitAnswers(formId, answers);
};

export const getAnswersByFormService = async (formId, userId) => {
  const form = await getFormById(formId);
  if (!form) throw new Error("Form not found");

  if (form.userId !== userId && form.template.ownerId !== userId) {
    throw new Error("Unauthorized to view answers for this form");
  }

  return await getAnswersByForm(formId);
};
