import {
  addUserToTemplateAccessService,
  removeUserFromTemplateAccessService,
  getTemplateAccessUsersService,
} from "../services/templateAccessService.js";

export const addUserToTemplateAccessController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const result = await addUserToTemplateAccessService(templateId, userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Remove User from Template Access
export const removeUserFromTemplateAccessController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId } = req.body;

    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    await removeUserFromTemplateAccessService(templateId, userId);
    res.json({ message: "User removed from template access" });
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
