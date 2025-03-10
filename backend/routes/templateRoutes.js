import express from "express";
import {
  createTemplateController,
  getTemplateByIdController,
  getAllTemplatesController,
  updateTemplateController,
  deleteTemplateController,
  getTemplatesByUserController,
} from "../controllers/templateController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  accessControl("template", "create"),
  createTemplateController
);
router.get(
  "/user",
  protect,
  accessControl("userTemplates", "getUserTemplates"),
  getTemplatesByUserController
);
router.get("/", optionalAuth, getAllTemplatesController);
router.get(
  "/:templateId",
  optionalAuth,
  accessControl("template", "read"),
  getTemplateByIdController
);
router.put(
  "/:templateId",
  protect,
  accessControl("template", "update"),
  updateTemplateController
);
router.delete(
  "/:templateId",
  protect,
  accessControl("template", "delete"),
  deleteTemplateController
);

export default router;
