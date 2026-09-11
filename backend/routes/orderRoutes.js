import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  [
    body("shippingAddress.street").trim().notEmpty().withMessage("Street address is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
    body("shippingAddress.postalCode").trim().notEmpty().withMessage("Postal code is required"),
    body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),
    body("paymentMethod")
      .optional()
      .isIn(["cod", "card", "upi", "paypal"])
      .withMessage("Invalid payment method"),
  ],
  validate,
  createOrder
);

router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/cancel", cancelOrder);

export default router;
