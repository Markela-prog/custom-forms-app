import express from "express";
import {
  submitAnswersController,
  updateAnswerController,
  deleteAnswerController,
} from "../controllers/answerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkAnswerAccess } from "../middleware/answerAccessMiddleware.js";
const router = express.Router();

router.post("/:formId", protect, submitAnswersController);
router.put("/:formId/:answerId", protect, checkAnswerAccess, updateAnswerController);
router.delete("/:formId/:answerId", protect, checkAnswerAccess, deleteAnswerController);

export default router;