import express from "express";
import { body } from "express-validator";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

const productValidationRules = [
  body("name").trim().notEmpty().withMessage("Product name is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
];

router.get("/", getProducts);
router.get("/meta/categories", getCategories);
router.get("/:id", getProductById);

router.post("/", protect, adminOnly, productValidationRules, validate, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

router.post(
  "/:id/reviews",
  protect,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().trim().isLength({ max: 500 }),
  ],
  validate,
  addReview
);

export default router;
