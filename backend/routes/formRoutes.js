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
import { checkTemplateAccess, checkOwnerOrAdmin, checkFormAccess, preventDuplicateFormSubmission } from "../middleware/accessControlMiddleware.js";

const router = express.Router();

router.post("/:templateId", protect, checkTemplateAccess, preventDuplicateFormSubmission, createFormController);

router.get("/template/:templateId", protect, checkOwnerOrAdmin, getFormsByTemplateController);

router.get("/user/:userId", protect, getFormsByUserController);
router.get("/:formId", protect, checkFormAccess, getFormByIdController);

router.delete("/:formId", protect, checkOwnerOrAdmin, deleteFormController);
router.put("/:formId/finalize", protect, checkFormAccess, finalizeFormController);

export default router;