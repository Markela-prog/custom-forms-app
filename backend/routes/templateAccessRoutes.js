import express from "express";
import {
  addUserToTemplateAccessController,
  removeUserFromTemplateAccessController,
  getTemplateAccessUsersController,
} from "../controllers/templateAccessController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkOwnerOrAdmin } from "../middleware/accessControlMiddleware.js";
const router = express.Router();

router.post("/:templateId/access", protect, checkOwnerOrAdmin, addUserToTemplateAccessController);
router.delete("/:templateId/access", protect, checkOwnerOrAdmin, removeUserFromTemplateAccessController);
router.get("/:templateId/access", protect, checkOwnerOrAdmin, getTemplateAccessUsersController);

export default router;
