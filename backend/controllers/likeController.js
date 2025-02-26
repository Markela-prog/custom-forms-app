import { toggleLikeService } from "../services/likeService.js";

export const toggleLikeController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;

    const result = await toggleLikeService(userId, templateId);
    res.json(result);
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
