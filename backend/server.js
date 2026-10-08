import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { logSentinelContainment, logSentinelTelemetry } from "./middleware/logSentinel.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Security & core middleware
app.use(helmet());
// CLIENT_URL may be a comma-separated list; the LAN demo accepts any origin so other laptops can browse.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((o) => o.trim());
app.use(
  cors({
    origin: process.env.LOGSENTINEL_DEMO_MODE === "true" ? true : allowedOrigins,
    credentials: true,
  })
);
// Telemetry first so contained (403) requests are still reported to LogSentinel.
app.use("/api", logSentinelTelemetry, logSentinelContainment);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running", timestamp: new Date() });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// 404 + centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Bind all interfaces by default so other laptops on the LAN can reach the API.
const HOST = process.env.HOST || "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on http://${HOST}:${PORT}`);
});

export default app;
