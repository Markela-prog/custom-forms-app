import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCurrentUserProfile,
  getPublicUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getCurrentUserProfile);
router.put("/me", protect, updateUserProfile);
router.get("/:id", getPublicUserProfile);

export default router;
