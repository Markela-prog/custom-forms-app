import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCurrentUserProfile,
  getPublicUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";

const router = express.Router();
const upload = multer();

router.get("/me", protect, getCurrentUserProfile);
router.put("/me", protect, upload.single("profilePicture"), updateUserProfile);
router.get("/:id", getPublicUserProfile);

export default router;
