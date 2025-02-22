import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  promoteUsers,
  deleteUsers,
  demoteUsers,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, isAdmin, getAllUsers);
router.post("/promote", protect, isAdmin, promoteUsers);
router.post("/demote", protect, isAdmin, demoteUsers);
router.delete("/delete", protect, isAdmin, deleteUsers);

export default router;
