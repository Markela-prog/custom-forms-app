import express from "express";
import {
  addUserToTemplateAccessController,
  removeUserFromTemplateAccessController,
  getTemplateAccessUsersController,
} from "../controllers/templateAccessController.js";
import { protect } from "../middleware/authMiddleware.js";
//import { checkOwnerOrAdmin } from "../middleware/accessControlMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js"; // ✅ Use our unified access control

const router = express.Router();

// ✅ Add User to Template Access (Owner/Admin Only)
router.post("/:templateId/access", protect, accessControl("template", "manage_access"), addUserToTemplateAccessController);

// ✅ Remove User from Template Access (Owner/Admin Only)
router.delete("/:templateId/access", protect, accessControl("template", "manage_access"), removeUserFromTemplateAccessController);

// ✅ Get Users with Template Access (Owner/Admin Only)
router.get("/:templateId/access", protect, accessControl("template", "manage_access"), getTemplateAccessUsersController);

export default router;
