import express from "express";
import { body } from "express-validator";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post(
  "/items",
  [
    body("productId").notEmpty().withMessage("productId is required"),
    body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
  ],
  validate,
  addToCart
);
router.put(
  "/items/:productId",
  [body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer")],
  validate,
  updateCartItem
);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
