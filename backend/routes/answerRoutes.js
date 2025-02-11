import express from "express";
import {
  submitAnswersController,
  getAnswersByFormController,
  deleteAnswersByFormController,
} from "../controllers/answerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:formId", protect, submitAnswersController);
router.get("/:formId", protect, getAnswersByFormController);
router.delete("/:formId", protect, deleteAnswersByFormController);

export default router;