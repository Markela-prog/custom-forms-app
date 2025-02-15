import express from "express";
import {
  createQuestionController,
  getQuestionsByTemplateController,
  updateQuestionController,
  deleteQuestionController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { checkQuestionAccess, checkQuestionOwnerOrAdmin, checkReorderOwnership } from "../middleware/questionAccessMiddleware.js";
import { checkTemplateOwnerOrAdmin } from "../middleware/templateAccessMiddleware.js";
const router = express.Router();

router.put("/reorder", protect, checkReorderOwnership, reorderQuestionsController);
router.get("/:templateId", optionalAuth, checkQuestionAccess, getQuestionsByTemplateController);
router.post("/:templateId", protect, checkTemplateOwnerOrAdmin, createQuestionController);
router.put("/:questionId", protect, checkQuestionOwnerOrAdmin, updateQuestionController);
router.delete("/:questionId", protect, checkQuestionOwnerOrAdmin, deleteQuestionController);

export default router;
