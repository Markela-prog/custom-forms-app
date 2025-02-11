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

const router = express.Router();

router.post("/", protect, createTemplateController);
router.get("/:id", getTemplateByIdController);
router.get("/", getAllTemplatesController);
router.put("/:id", protect, updateTemplateController);
router.delete("/:id", protect, deleteTemplateController);

export default router;
