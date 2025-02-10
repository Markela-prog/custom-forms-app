import {
    findAllUsers,
    findUserById,
    updateUserRole,
    deleteUserById,
  } from "../repositories/adminRepository.js";
  import { handleError } from "../utils/errorHandler.js";
  
  export const getAllUsersService = async () => {
    return findAllUsers();
  };
  
  export const promoteUserService = async (userId) => {
    if (!userId) throw new Error("User ID is required");
  
    const user = await findUserById(userId);
    if (!user) throw new Error("User not found");
  
    return updateUserRole(userId, "ADMIN");
  };
  
  export const demoteUserService = async (userId, currentAdminId) => {
    if (!userId) throw new Error("User ID is required");
  
    if (userId === currentAdminId) {
      throw new Error("You cannot demote yourself");
    }
  
    const user = await findUserById(userId);
    if (!user) throw new Error("User not found");
  
    return updateUserRole(userId, "USER");
  };
  
  export const deleteUserService = async (userId) => {
    if (!userId) throw new Error("User ID is required");
  
    const user = await findUserById(userId);
    if (!user) throw new Error("User not found");
  
    return deleteUserById(userId);
  };
  