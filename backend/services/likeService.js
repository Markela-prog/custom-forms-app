import {
    findLike,
    createLike,
    deleteLike,
    countLikes,
    updateTemplateLikes,
  } from "../repositories/likeRepository.js";
  
  export const toggleLikeService = async (userId, templateId) => {
    // Check if the user already liked the template
    const existingLike = await findLike(userId, templateId);
  
    if (existingLike) {
      // Remove the like if it exists
      await deleteLike(userId, templateId);
    } else {
      // Create a new like
      await createLike(userId, templateId);
    }
  
    // Update like count in TemplateStats
    const totalLikes = await countLikes(templateId);
    await updateTemplateLikes(templateId, totalLikes);
  
    return { liked: !existingLike, totalLikes };
  };
  