import {
  findLike,
  createLike,
  deleteLike,
  countLikes,
  updateTemplateLikes,
} from "../repositories/likeRepository.js";

export const toggleLikeService = async (userId, templateId) => {

  const existingLike = await findLike(userId, templateId);

  if (existingLike) {
    await deleteLike(userId, templateId);
  } else {
    await createLike(userId, templateId);
  }

  const totalLikes = await countLikes(templateId);
  await updateTemplateLikes(templateId, totalLikes);

  return { liked: !existingLike, totalLikes };
};
