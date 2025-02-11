import express from "express";
import {
  submitAnswersController,
  getAnswersByFormController,
} from "../controllers/answerController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:formId", protect, submitAnswersController);
router.get("/:formId", protect, getAnswersByFormController);

export default router;