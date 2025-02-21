import express from "express";
import {
  addUsersToTemplateAccessController,
  removeUsersFromTemplateAccessController,
  getTemplateAccessUsersController,
} from "../controllers/templateAccessController.js";
import { protect } from "../middleware/authMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";

const router = express.Router();

router.post("/:templateId/access", protect, accessControl("template", "manage_access"), addUsersToTemplateAccessController);

router.delete("/:templateId/access", protect, accessControl("template", "manage_access"), removeUsersFromTemplateAccessController);

router.get("/:templateId/access", protect, accessControl("template", "manage_access"), getTemplateAccessUsersController);

export default router;
