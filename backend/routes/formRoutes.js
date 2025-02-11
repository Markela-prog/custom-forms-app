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

router.post("/:templateId", protect, createFormController); // Create form
router.get("/:formId", protect, getFormByIdController); // Get form by ID
router.get("/template/:templateId", protect, getFormsByTemplateController); // Get forms for template
router.get("/user/:userId", protect, getFormsByUserController); // Get forms by user
router.delete("/:formId", protect, deleteFormController); // Delete form
router.put("/:formId/finalize", protect, finalizeFormController); // Finalize form

export default router;
