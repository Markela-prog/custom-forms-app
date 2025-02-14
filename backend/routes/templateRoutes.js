import express from "express";
import {
  createTemplateController,
  getTemplateByIdController,
  getAllTemplatesController,
  updateTemplateController,
  deleteTemplateController,
} from "../controllers/templateController.js";
import { protect, optionalAuth } from "../middleware/authMiddleware.js";
import { checkTemplateAccess, checkTemplateOwnerOrAdmin } from "../middleware/templateAccessMiddleware.js";

const router = express.Router();

router.post("/", protect, createTemplateController);

router.get("/:templateId", optionalAuth, checkTemplateAccess, getTemplateByIdController);

router.get("/", optionalAuth, getAllTemplatesController);

router.put("/:templateId", protect, checkTemplateOwnerOrAdmin, updateTemplateController);

router.delete("/:templateId", protect, checkTemplateOwnerOrAdmin, deleteTemplateController);

export default router;
