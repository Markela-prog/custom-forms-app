import {
  addUsersToTemplateAccessService,
  removeUsersFromTemplateAccessService,
  getTemplateAccessUsersService,
} from "../services/templateAccessService.js";

export const addUsersToTemplateAccessController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userIds } = req.body; // Accept multiple userIds

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "User IDs must be a non-empty array" });
    }

    const result = await addUsersToTemplateAccessService(templateId, userIds);
    res
      .status(201)
      .json({ message: "Users granted access successfully", result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeUsersFromTemplateAccessController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userIds } = req.body; // Accept multiple userIds

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "User IDs must be a non-empty array" });
    }

    await removeUsersFromTemplateAccessService(templateId, userIds);
    res.json({ message: "Users removed from template access" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Get Users with Template Access
export const getTemplateAccessUsersController = async (req, res) => {
  try {
    const { templateId } = req.params;

    const users = await getTemplateAccessUsersService(templateId);
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
