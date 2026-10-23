import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import { handleJsonSyntaxError } from "./middleware/jsonErrorMiddleware.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { securityHeaders, rateLimiter } from "./middleware/securityMiddleware.js";
import { requestTimeout } from "./middleware/timeoutMiddleware.js";

import healthRoutes from "./modules/health/health.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import productRoutes from "./modules/product/product.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import orderRoutes from "./modules/order/order.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import shippingRoutes from "./modules/shipping/shipping.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import wishlistRoutes from "./modules/wishlist/wishlist.routes.js";

const app = express();

app.use(securityHeaders);

const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20, // max 20 requests per IP per window
  message: "Too many authentication requests, please try again in 15 minutes.",
});

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestTimeout(15000)); // 15s global timeout untuk mencegah hanging connections

app.use(handleJsonSyntaxError);

// Health check endpoint (tidak perlu rate limit/auth untuk Docker & K8s probes)
app.use("/api", healthRoutes);

// Serve static images from public folder
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use("/uploads/products", express.static(path.join(process.cwd(), "public/img/products")));
app.use("/uploads", express.static(path.join(process.cwd(), "public/img")));
app.use("/img/products", express.static(path.join(process.cwd(), "public/img/products")));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shippings", shippingRoutes);
app.use("/api", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use(errorHandler);

export default app;
