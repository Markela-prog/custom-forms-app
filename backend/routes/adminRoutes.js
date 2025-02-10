import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  promoteUser,
  demoteUser,
  deleteUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, isAdmin, getAllUsers);
router.post("/promote", protect, isAdmin, promoteUser);
router.post("/demote", protect, isAdmin, demoteUser);
router.delete("/delete", protect, isAdmin, deleteUser);

export default router;

