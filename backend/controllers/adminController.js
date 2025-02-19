import {
  getAllUsersService,
  promoteUserService,
  demoteUserService,
  deleteUserService,
} from "../services/adminService.js";
import { handleError } from "../utils/errorHandler.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (error) {
    handleError(res, error.message, 500);
  }
};

export const promoteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length === 0) throw new Error("No users selected");

    await Promise.all(userIds.map((userId) => promoteUserService(userId)));

    res.json({ message: "Users promoted successfully" });
  } catch (error) {
    handleError(res, error.message, 400);
  }
};

export const demoteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length === 0) throw new Error("No users selected");

    await Promise.all(userIds.map((userId) => demoteUserService(userId)));

    res.json({ message: "Users demoted successfully" });
  } catch (error) {
    handleError(res, error.message, 400);
  }
};

export const deleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length === 0) throw new Error("No users selected");

    await Promise.all(userIds.map((userId) => deleteUserService(userId)));

    res.json({ message: "Users deleted successfully" });
  } catch (error) {
    handleError(res, error.message, 400);
  }
};
