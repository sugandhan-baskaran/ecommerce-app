import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError, asyncHandler } from "./errorHandler.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, no token provided", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new AppError("User account no longer exists or is inactive", 401);
  }

  req.user = user;
  next();
});

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new AppError("Not authorized. Admin access required", 403);
  }
  next();
};
