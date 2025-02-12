import {
  addUserToTemplateAccessService,
  removeUserFromTemplateAccessService,
  getTemplateAccessUsersService,
} from "../services/templateAccessService.js";

export const addUserToTemplateAccessController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId } = req.body;
    const ownerId = req.user.id;

    const result = await addUserToTemplateAccessService(
      templateId,
      ownerId,
      userId
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const removeUserFromTemplateAccessController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId } = req.body;
    const ownerId = req.user.id;

    await removeUserFromTemplateAccessService(templateId, ownerId, userId);
    res.json({ message: "User removed from template access" });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

export const getTemplateAccessUsersController = async (req, res) => {
  try {
    const { templateId } = req.params;
    const ownerId = req.user.id;

    const users = await getTemplateAccessUsersService(templateId, ownerId);
    res.json(users);
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};
