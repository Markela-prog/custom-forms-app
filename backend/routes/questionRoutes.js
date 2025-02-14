import express from "express";
import {
  createQuestionController,
  getQuestionsByTemplateController,
  updateQuestionController,
  deleteQuestionController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { checkQuestionPermission } from "../middleware/questionAccessMiddleware.js";
const router = express.Router();

router.put("/reorder", protect, checkQuestionPermission({ modify: true }), reorderQuestionsController);
router.get("/:templateId", optionalAuth, checkQuestionPermission({ modify: false }), getQuestionsByTemplateController);
router.post("/:templateId", protect, checkQuestionPermission({ modify: true }), createQuestionController);
router.put("/:questionId", protect, checkQuestionPermission({ modify: true }), updateQuestionController);
router.delete("/:questionId", protect, checkQuestionPermission({ modify: true }), deleteQuestionController);

export default router;
