import express from "express";
import {
  createFormController,
  getFormByIdController,
  getFormsByTemplateController,
  getFormsByUserController,
  deleteFormController,
  finalizeFormController,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:templateId", protect, createFormController);
router.get("/:formId", protect, getFormByIdController);
router.get("/template/:templateId", protect, getFormsByTemplateController);
router.get("/user/:userId", protect, getFormsByUserController);
router.delete("/:formId", protect, deleteFormController);
router.put("/:formId/finalize", protect, finalizeFormController);

export default router;
