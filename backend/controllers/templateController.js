import {
  createTemplateService,
  getTemplateByIdService,
  getAllTemplatesService,
  updateTemplateService,
  deleteTemplateService,
} from "../services/templateService.js";

export const createTemplateController = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const newTemplate = await createTemplateService(ownerId, req.body);
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getTemplateByIdController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await getTemplateByIdService(templateId);
    res.json(template);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getAllTemplatesController = async (req, res) => {
  try {
    console.log("🔹 User in Request:", req.user);

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const userId = req.user?.id || null;
    const isAdmin = req.user?.role === "ADMIN";

    console.log("✅ Fetching Templates for User:", { userId, isAdmin });

    const templates = await getAllTemplatesService(
      page,
      pageSize,
      userId,
      isAdmin
    );

    console.log("✅ Templates Retrieved:", templates.length);
    res.json(templates);
  } catch (error) {
    console.error("❌ Error fetching templates:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateTemplateController = async (req, res) => {
  try {
    const updatedTemplate = await updateTemplateService(
      req.params.templateId,
      req.body
    );
    res.json(updatedTemplate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteTemplateController = async (req, res) => {
  try {
    await deleteTemplateService(req.params.templateId);
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
