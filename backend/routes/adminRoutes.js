import express from "express";
import {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getDashboardStats);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/users", getAllUsers);
router.put("/users/:id/status", toggleUserStatus);

export default router;
