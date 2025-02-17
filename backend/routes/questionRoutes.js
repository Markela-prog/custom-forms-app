import express from "express";
import {
  createQuestionController,
  getQuestionsByTemplateController,
  updateQuestionController,
  deleteQuestionController,
  reorderQuestionsController,
} from "../controllers/questionController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
//import { checkQuestionAccess, checkQuestionOwnerOrAdmin, checkReorderOwnership } from "../middleware/questionAccessMiddleware.js";
//import { checkTemplateOwnerOrAdmin } from "../middleware/templateAccessMiddleware.js";
const router = express.Router();

router.put("/reorder", protect, accessControl("question", "reorder"), reorderQuestionsController);
router.get("/:templateId", optionalAuth, accessControl("question", "read"), getQuestionsByTemplateController);
router.post("/:templateId", protect, accessControl("question", "create"), createQuestionController);
router.put("/:questionId", protect, accessControl("question", "update"), updateQuestionController);
router.delete("/:questionId", protect, accessControl("question", "delete"), deleteQuestionController);


export default router;
