import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const SHIPPING_FLAT_RATE = 10;

// @desc    Create a new order from the current cart
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    throw new AppError("Your cart is empty", 400);
  }

  // Verify stock availability for every item before committing the order
  for (const item of cart.items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new AppError(`Product "${item.name}" is no longer available`, 400);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for "${item.name}"`, 400);
    }
  }

  const itemsPrice = Number(
    cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2)
  );
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Number((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((i) => ({
      product: i.product,
      name: i.name,
      image: i.image,
      price: i.price,
      quantity: i.quantity,
    })),
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentMethod !== "cod",
    paidAt: paymentMethod !== "cod" ? new Date() : undefined,
  });

  // Decrement stock for each purchased product
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, message: "Order placed successfully", data: { order } });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, count: orders.length, data: { orders } });
});

// @desc    Get single order (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new AppError("Order not found", 404);

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new AppError("Not authorized to view this order", 403);
  }

  res.status(200).json({ success: true, data: { order } });
});

// @desc    Cancel own order (only while pending/processing)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new AppError("Not authorized to cancel this order", 403);
  }

  if (!["pending", "processing"].includes(order.status)) {
    throw new AppError(`Cannot cancel an order that is already ${order.status}`, 400);
  }

  order.status = "cancelled";
  order.cancelReason = req.body.reason || "Cancelled by user";

  // Restock cancelled items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  await order.save();
  res.status(200).json({ success: true, message: "Order cancelled", data: { order } });
});
