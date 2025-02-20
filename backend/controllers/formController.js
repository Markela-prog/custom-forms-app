import {
  createFormService,
  getFormByIdService,
  getFormsByTemplateService,
  getFormsByUserService,
  deleteFormService,
  getFormsByUserAndTemplate
} from "../services/formService.js";

export const createFormController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { emailCopyRequested } = req.body;
    const userId = req.user.id;

    const form = await createFormService(
      templateId,
      userId,
      emailCopyRequested
    );
    res.status(201).json(form);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getFormDetailsController = async (req, res) => {
  try {
    const { formId } = req.params;
    const includeAnswers = req.query.include === "answers";

    const form = await getFormDetailsService(formId, includeAnswers);
    res.json(form);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getFormByIdController = async (req, res) => {
  try {
    const form = await getFormByIdService(req.params.formId);
    res.json(form);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getFormsByTemplateController = async (req, res) => {
  try {
    const forms = await getFormsByTemplateService(req.params.templateId);
    res.json(forms);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getFormsByUserController = async (req, res) => {
  try {
    const forms = await getFormsByUserService(req.user.id);
    res.json(forms);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const deleteFormController = async (req, res) => {
  try {
    await deleteFormService(req.params.formId, req.user);
    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const checkFormSubmissionController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user.id;

    const existingForm = await getFormsByUserAndTemplate(userId, templateId);
    res.json({ hasSubmitted: !!existingForm });
  } catch (error) {
    console.error("Check Form Submission Error:", error);
    res.status(500).json({ message: "Server error checking form submission" });
  }
};


