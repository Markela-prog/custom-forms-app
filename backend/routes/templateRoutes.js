import express from "express";
import {
  createTemplateController,
  getTemplateByIdController,
  getAllTemplatesController,
  updateTemplateController,
  deleteTemplateController,
} from "../controllers/templateController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
//import { checkTemplateAccess, checkTemplateUpdate, checkTemplateDelete } from "../middleware/templateAccessMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";

const router = express.Router();

router.post("/", protect, accessControl("template", "create"), createTemplateController);
router.get("/:templateId", optionalAuth, accessControl("template", "read"), getTemplateByIdController);
router.get("/", optionalAuth, getAllTemplatesController);
router.put("/:templateId", protect, accessControl("template", "update"), updateTemplateController);
router.delete("/:templateId", protect, accessControl("template", "delete"), deleteTemplateController);

export default router;
