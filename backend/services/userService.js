import {
  findUserById,
  updateUserProfile as updateUserProfileRepo,
} from "../repositories/userRepository.js";

import { uploadImage, deleteImage } from "../utils/cloudinary.js";

export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserProfileService = async (
  userId,
  updateData,
  fileBuffer,
  fileType
) => {
  if (!updateData && !fileBuffer) throw new Error("No update data provided");

  const validFields = ["username"];
  const updatePayload = {};

  validFields.forEach((field) => {
    if (updateData[field]) updatePayload[field] = updateData[field];
  });

  const user = await findUserById(userId);

  let newImageUrl = user.profilePicture;

  if (user.profilePicture && fileBuffer) {
    await deleteImage(user.profilePicture);
  }

  if (fileBuffer) {
    newImageUrl = await uploadImage(fileBuffer, fileType);
  }

  return updateUserProfileRepo(userId, {
    ...updatePayload,
    profilePicture: newImageUrl,
  });
};
