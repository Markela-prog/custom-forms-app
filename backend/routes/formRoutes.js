import express from "express";
import {
  createFormController,
  getFormByIdController,
  getFormsByTemplateController,
  getFormsByUserController,
  deleteFormController,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";
//import { checkFormAccess, checkFormDeleteAccess, preventDuplicateFormSubmission } from "../middleware/formAccessMiddleware.js";
//import { checkTemplateAccess } from "../middleware/templateAccessMiddleware.js";

const router = express.Router();

router.post("/:templateId", protect, accessControl("form", "create"), createFormController);
router.get("/template/:templateId", protect, accessControl("form", "read"), getFormsByTemplateController);
router.get("/user", protect, accessControl("form", "read"), getFormsByUserController);
router.get("/:formId", protect, accessControl("form", "read"), getFormByIdController);
router.delete("/:formId", protect, accessControl("form", "delete"), deleteFormController);

export default router;