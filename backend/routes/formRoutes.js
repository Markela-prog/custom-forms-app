import express from "express";
import {
  getFormByIdController,
  getFormsByTemplateController,
  getFormsByUserController,
  deleteFormController,
  checkFormSubmissionController,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";
const router = express.Router();

router.get(
  "/template/:templateId",
  protect,
  accessControl("templateForms", "read"),
  getFormsByTemplateController
);
router.get(
  "/user",
  protect,
  accessControl("userForms", "getUserForms"),
  getFormsByUserController
);
router.get(
  "/:formId",
  protect,
  accessControl("form", "read"),
  getFormByIdController
);
router.delete(
  "/:formId",
  protect,
  accessControl("form", "delete"),
  deleteFormController
);
router.get(
  "/check-submission/:templateId",
  protect,
  accessControl("userForms", "getUserForms"),
  checkFormSubmissionController
);

export default router;
