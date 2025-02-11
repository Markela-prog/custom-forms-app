import {
    submitAnswers,
    getAnswersByForm,
  } from "../repositories/answerRepository.js";
  import { getFormById } from "../repositories/formRepository.js";
  
  /**
   * Submit answers for a form
   * Ensures that the user is authorized and form exists.
   */
  export const submitAnswersService = async (formId, answers, userId) => {
    const form = await getFormById(formId);
    if (!form) throw new Error("Form not found");
  
    // Check if user owns the form or has access
    if (form.userId !== userId && form.template.ownerId !== userId) {
      throw new Error("Unauthorized to submit answers for this form");
    }
  
    return await submitAnswers(formId, answers);
  };
  
  /**
   * Get all answers for a specific form
   */
  export const getAnswersByFormService = async (formId, userId) => {
    const form = await getFormById(formId);
    if (!form) throw new Error("Form not found");
  
    // Only allow the form owner or template owner to view answers
    if (form.userId !== userId && form.template.ownerId !== userId) {
      throw new Error("Unauthorized to view answers for this form");
    }
  
    return await getAnswersByForm(formId);
  };
  