import {
  createFormService,
  getFormByIdService,
  getFormsByTemplateService,
  getFormsByUserService,
  deleteFormService,
  updateFormController,
  finalizeFormService,
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
    res.status(404).json({ message: error.message });
  }
};

export const getFormsByUserController = async (req, res) => {
  try {
    const forms = await getFormsByUserService(req.params.userId);
    res.json(forms);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateFormController = async (req, res) => {
  try {
    const { formId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    const result = await updateFormService(formId, answers, userId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFormController = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user.id;

    await deleteFormService(formId, userId);
    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const finalizeFormController = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user.id;

    await finalizeFormService(formId, userId);
    res.json({ message: "Form finalized successfully" });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};
