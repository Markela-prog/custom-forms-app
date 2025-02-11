import {
    submitAnswers,
    getAnswersByFormId,
    deleteAnswersByFormId,
  } from "../repositories/answerRepository.js";
  
  export const submitAnswersService = async (formId, answers) => {
    return await submitAnswers(formId, answers);
  };
  
  export const getAnswersByFormService = async (formId) => {
    return await getAnswersByFormId(formId);
  };
  
  export const deleteAnswersByFormService = async (formId) => {
    return await deleteAnswersByFormId(formId);
  };
  