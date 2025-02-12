import {
  createTemplateService,
  getTemplateByIdService,
  getAllTemplatesService,
  updateTemplateService,
  deleteTemplateService,
} from "../services/templateService.js";

export const createTemplateController = async (req, res) => {
  try {
    const ownerId = req.user.id; // Extracted from JWT
    const newTemplate = await createTemplateService(ownerId, req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTemplateByIdController = async (req, res) => {
  try {
    const template = await getTemplateByIdService(
      req.params.id,
      req.user.id,
      req.user.role === "ADMIN"
    );
    res.json(template);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};
export const getAllTemplatesController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const templates = await getAllTemplatesService(page, pageSize);
    res.json(templates);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateTemplateController = async (req, res) => {
  try {
    const updatedTemplate = await updateTemplateService(
      req.params.id,
      req.body
    );
    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTemplateController = async (req, res) => {
  try {
    await deleteTemplateService(req.params.id);
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
