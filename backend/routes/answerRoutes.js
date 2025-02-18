import express from "express";
import {
  submitAnswersController,
  updateAnswerController,
  deleteAnswerController,
} from "../controllers/answerController.js";
import { protect } from "../middleware/authMiddleware.js";
//import { checkAnswerAccess } from "../middleware/answerAccessMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";
const router = express.Router();

router.post(
  "/:templateId/submit",
  protect,
  accessControl("form", "create"),
  submitAnswersController
);
router.put("/:formId/:answerId", protect, accessControl("answer", "update"), updateAnswerController);
router.delete("/:formId/:answerId", protect, accessControl("answer", "delete"), deleteAnswerController);

export default router;