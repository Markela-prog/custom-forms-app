import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { toggleLikeController } from "../controllers/likeController.js";

const router = express.Router();

router.post("/:templateId/like", protect, toggleLikeController);

export default router;
