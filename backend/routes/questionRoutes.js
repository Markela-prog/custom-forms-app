import express from "express";
import {
  createQuestionController,
  getQuestionsByTemplateController,
  updateQuestionController,
  deleteQuestionController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/reorder", protect, reorderQuestionsController);
router.post("/:templateId", protect, createQuestionController);
router.get("/:templateId", getQuestionsByTemplateController);
router.put("/:questionId", protect, updateQuestionController);
router.delete("/:questionId", protect, deleteQuestionController);


export default router;
