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
  
  export const promoteUser = async (req, res) => {
    try {
      const user = await promoteUserService(req.body.userId);
      res.json({ message: "User promoted to admin", user });
    } catch (error) {
      handleError(res, error.message, 400);
    }
  };
  
  export const demoteUser = async (req, res) => {
    try {
      const user = await demoteUserService(req.body.userId, req.user.id);
      res.json({ message: "User demoted to regular user", user });
    } catch (error) {
      handleError(res, error.message, 400);
    }
  };
  
  export const deleteUser = async (req, res) => {
    try {
      await deleteUserService(req.body.userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      handleError(res, error.message, 400);
    }
  };
  