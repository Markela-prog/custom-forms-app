import {
  findUserById,
  updateUserProfile as updateUserProfileRepo,
} from "../repositories/userRepository.js";
import prisma from "../prisma/prismaClient.js";
import { uploadImage, deleteImage } from "../utils/cloudinary.js";

export const getUserProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserProfileService = async (userId, updateData, fileBuffer, fileType) => {
    if (!updateData && !fileBuffer) throw new Error("No update data provided");
  
    const validFields = ["username"];
    const updatePayload = {};
  
    validFields.forEach((field) => {
      if (updateData[field]) updatePayload[field] = updateData[field];
    });
  
    // 🔍 Fetch user's current profile picture
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicture: true },
    });
  
    // 🗑 Delete old image if a new one is uploaded
    if (user?.profilePicture && fileBuffer) {
      console.log(`Deleting previous image: ${user.profilePicture}`);
      await deleteImage(user.profilePicture);
    }
  
    // 📤 Upload new image if provided
    if (fileBuffer) {
      const uploadedImage = await uploadImage(fileBuffer, fileType);
      updatePayload.profilePicture = uploadedImage.secure_url;
    }
  
    // ✅ Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });
  
    console.log("✅ Profile updated successfully:", updatedUser);
    return updatedUser;
  };
  