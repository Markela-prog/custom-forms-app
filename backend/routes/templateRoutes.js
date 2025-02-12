// src/routes/templateRoutes.js
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

router.get("/:id", checkTemplateAccess, getTemplateByIdController);
router.get("/", getAllTemplatesController);

router.put("/:id", protect, checkOwnerOrAdmin, updateTemplateController);
router.delete("/:id", protect, checkOwnerOrAdmin, deleteTemplateController);

export default router;
