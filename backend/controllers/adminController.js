import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../middleware/errorHandler.js";

// @desc    Get admin dashboard summary stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg, lowStock, orderStatusAgg] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
      Product.countDocuments({ isActive: true, stock: { $lte: 5 } }),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: Number((revenueAgg[0]?.total || 0).toFixed(2)),
      lowStockProducts: lowStock,
      ordersByStatus: orderStatusAgg,
    },
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { orders },
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);

  order.status = status;
  if (status === "delivered") order.deliveredAt = new Date();

  await order.save();
  res.status(200).json({ success: true, message: "Order status updated", data: { order } });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.status(200).json({ success: true, count: users.length, data: { users } });
});

// @desc    Activate/deactivate a user account (admin)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin") throw new AppError("Cannot deactivate an admin account", 400);

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? "activated" : "deactivated"}`,
    data: { user: user.toSafeObject() },
  });
});
