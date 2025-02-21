import express from "express";
import {
  addUsersToTemplateAccessController,
  removeUsersFromTemplateAccessController,
  getTemplateAccessUsersController,
  getNonAdminUsersController
} from "../controllers/templateAccessController.js";
import { protect } from "../middleware/authMiddleware.js";
import { accessControl } from "../middleware/accessControlMiddleware.js";

const router = express.Router();

router.get("/non-admin-users", protect, accessControl("user", "fetch_non_admin"), getNonAdminUsersController);

router.post("/:templateId/access", protect, accessControl("template", "manage_access"), addUsersToTemplateAccessController);

router.delete("/:templateId/access", protect, accessControl("template", "manage_access"), removeUsersFromTemplateAccessController);

router.get("/:templateId/access", protect, accessControl("template", "manage_access"), getTemplateAccessUsersController);



export default router;
