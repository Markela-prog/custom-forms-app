export const validateTemplate = (template) => {
    if (!template.title.trim()) {
      return { isValid: false, message: "❌ Template title is required." };
    }
    return { isValid: true, message: "" };
  };
  
  export const validateQuestions = (questions) => {
    for (const question of questions) {
      if (!question.title.trim()) {
        return {
          isValid: false,
          message: "❌ Each question must have a title.",
        };
      }
  
      if (
        ["CHECKBOX", "RADIOBOX", "DROPDOWN"].includes(question.type) &&
        (!question.options || question.options.length === 0 || 
        question.options.every((opt) => !opt.trim()))
      ) {
        return {
          isValid: false,
          message: `❌ "${question.title}" must have at least one option.`,
        };
      }
    }
  
    return { isValid: true, message: "" };
  };
  