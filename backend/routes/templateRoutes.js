import express from "express";
import {
  createTemplateController,
  getTemplateByIdController,
  getAllTemplatesController,
  updateTemplateController,
  deleteTemplateController,
} from "../controllers/templateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkTemplateAccess, checkOwnerOrAdmin } from "../middleware/accessControlMiddleware.js";

const router = express.Router();

router.post("/", protect, createTemplateController);

router.get("/:templateId", checkTemplateAccess, getTemplateByIdController);

router.get("/", getAllTemplatesController);

router.put("/:templateId", protect, checkOwnerOrAdmin, updateTemplateController);

router.delete("/:templateId", protect, checkOwnerOrAdmin, deleteTemplateController);

export default router;
