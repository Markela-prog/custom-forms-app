import express from "express";
import {
  createQuestionController,
  getQuestionsByTemplateController,
  updateQuestionController,
  deleteQuestionController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { checkQuestionAccess, checkQuestionOwnerOrAdmin, checkReorderPermission } from "../middleware/questionAccessMiddleware.js";
const router = express.Router();

router.get("/:templateId", optionalAuth, checkQuestionAccess, getQuestionsByTemplateController);
router.post("/:templateId", protect, checkQuestionOwnerOrAdmin, createQuestionController);
router.put("/:questionId", protect, checkQuestionOwnerOrAdmin, updateQuestionController);
router.delete("/:questionId", protect, checkQuestionOwnerOrAdmin, deleteQuestionController);
router.put("/reorder", protect, checkReorderPermission, reorderQuestionsController);


export default router;
