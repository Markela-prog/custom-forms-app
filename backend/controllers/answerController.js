import {
    submitAnswersService,
    getAnswersByFormService,
  } from "../services/answerService.js";
  
  export const submitAnswersController = async (req, res) => {
    try {
      const { formId } = req.params;
      const { answers } = req.body;
  
      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Invalid answers format" });
      }
  
      const result = await submitAnswersService(formId, answers, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error submitting answers:", error);
      res.status(400).json({ message: error.message });
    }
  };
  
  export const getAnswersByFormController = async (req, res) => {
    try {
      const { formId } = req.params;
      const answers = await getAnswersByFormService(formId, req.user.id);
      res.json(answers);
    } catch (error) {
      console.error("Error retrieving answers:", error);
      res.status(400).json({ message: error.message });
    }
  };
  