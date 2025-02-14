import express from "express";
import {
  createQuestionController,
  getQuestionsByTemplateController,
  updateQuestionController,
  deleteQuestionController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkOwnerOrAdmin } from "../middleware/accessControlMiddleware.js";
const router = express.Router();

router.put("/reorder", protect, checkOwnerOrAdmin, reorderQuestionsController);
router.post("/:templateId", protect, checkOwnerOrAdmin, createQuestionController);
router.get("/:templateId", checkOwnerOrAdmin, getQuestionsByTemplateController);
router.put("/:questionId", protect, checkOwnerOrAdmin, updateQuestionController);
router.delete("/:questionId", protect, checkOwnerOrAdmin, deleteQuestionController);


export default router;
