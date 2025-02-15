import express from "express";
import {
  createFormController,
  getFormByIdController,
  getFormsByTemplateController,
  getFormsByUserController,
  deleteFormController,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkFormAccess, preventDuplicateFormSubmission } from "../middleware/formAccessMiddleware.js";
import { checkTemplateAccess } from "../middleware/templateAccessMiddleware.js";

const router = express.Router();

router.post("/:templateId", protect, preventDuplicateFormSubmission, createFormController);
router.get("/template/:templateId", protect, checkTemplateAccess, getFormsByTemplateController);
router.get("/user", protect, getFormsByUserController);
router.get("/:formId", protect, checkFormAccess, getFormByIdController);
router.delete("/:formId", protect, checkFormAccess, deleteFormController);

export default router;