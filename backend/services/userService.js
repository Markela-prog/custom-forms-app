import {
  findUserById,
  updateUserProfile,
} from "../repositories/userRepository.js";
import { handleError } from "../utils/errorHandler.js";

export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserProfileService = async (userId, updateData) => {
  if (!updateData) throw new Error("No update data provided");

  const validFields = ["username", "profilePicture"];
  const updatePayload = {};

  validFields.forEach((field) => {
    if (updateData[field]) updatePayload[field] = updateData[field];
  });

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("Invalid update fields");
  }

  return updateUserProfile(userId, updatePayload);
};
