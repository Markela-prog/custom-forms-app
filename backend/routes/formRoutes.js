import express from "express";
import {
  createFormController,
  getFormByIdController,
  getFormsByTemplateController,
  getFormsByUserController,
  deleteFormController,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";
const router = express.Router();

//router.post("/:templateId", protect, accessControl("form", "create"), createFormController);

router.get("/template/:templateId", protect, accessControl("templateForms", "read"), getFormsByTemplateController);
router.get("/user", protect, accessControl("user", "getUserForms"), getFormsByUserController);
router.get("/:formId", protect, accessControl("form", "read"), getFormByIdController);
router.delete("/:formId", protect, accessControl("form", "delete"), deleteFormController);

export default router;