import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ success: true, data: { cart } });
});

// @desc    Add item to cart (or increase quantity)
// @route   POST /api/cart/items
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError("Product not found", 404);
  if (product.stock < quantity) throw new AppError("Insufficient stock available", 400);

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product.toString() === productId);

  if (existingItem) {
    const newQty = existingItem.quantity + Number(quantity);
    if (newQty > product.stock) throw new AppError("Insufficient stock available", 400);
    existingItem.quantity = newQty;
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || "",
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      quantity,
    });
  }

  await cart.save();
  res.status(200).json({ success: true, message: "Item added to cart", data: { cart } });
});

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/items/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) throw new AppError("Quantity must be at least 1", 400);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);
  if (quantity > product.stock) throw new AppError("Insufficient stock available", 400);

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new AppError("Item not found in cart", 404);

  item.quantity = quantity;
  await cart.save();

  res.status(200).json({ success: true, message: "Cart updated", data: { cart } });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:productId
// @access  Private
export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user._id);

  cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  await cart.save();

  res.status(200).json({ success: true, message: "Item removed from cart", data: { cart } });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.status(200).json({ success: true, message: "Cart cleared", data: { cart } });
});
