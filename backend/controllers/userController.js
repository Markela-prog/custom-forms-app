import {
  getUserProfileService,
  updateUserProfileService,
} from "../services/userService.js";
import { handleError } from "../utils/errorHandler.js";

export const getCurrentUserProfile = async (req, res) => {
  try {
    const user = await getUserProfileService(req.user.id);
    res.json(user);
  } catch (error) {
    handleError(res, error.message, 404);
  }
};

export const getPublicUserProfile = async (req, res) => {
  try {
    const user = await getUserProfileService(req.params.id);
    if (!user) return handleError(res, "User not found", 404);

    const publicProfile = {
      id: user.id,
      username: user.username || "Anonymous",
      profilePicture: user.profilePicture || null,
      createdAt: user.createdAt,
    };

    res.json(publicProfile);
  } catch (error) {
    handleError(res, error.message, 404);
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updatedUser = await updateUserProfileService(req.user.id, req.body);
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    handleError(res, error.message, 400);
  }
};
