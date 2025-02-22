import express from "express";
import {
  createQuestionsController,
  getQuestionsByTemplateController,
  updateMultipleQuestionsController,
  deleteMultipleQuestionsController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";
const router = express.Router();

router.put("/reorder", protect, accessControl("question", "reorder"), reorderQuestionsController);
router.get("/:templateId", optionalAuth, accessControl("question", "read"), getQuestionsByTemplateController);
router.post("/:templateId", protect, accessControl("question", "create"), createQuestionsController);
router.put("/update", protect, accessControl("question", "update"), updateMultipleQuestionsController);
router.delete("/delete", protect, accessControl("question", "delete"), deleteMultipleQuestionsController);


export default router;
