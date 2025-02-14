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
import { checkFormAccess, preventDuplicateFormSubmission } from "../middleware/formAccessMiddleware.js";

const router = express.Router();

router.post("/:templateId", protect, preventDuplicateFormSubmission, createFormController);
router.get("/template/:templateId", protect, getFormsByTemplateController);
router.get("/user/:userId", protect, getFormsByUserController);
router.get("/:formId", protect, checkFormAccess, getFormByIdController);
router.delete("/:formId", protect, checkFormAccess, deleteFormController);
router.put("/:formId/finalize", protect, checkFormAccess, finalizeFormController);

export default router;