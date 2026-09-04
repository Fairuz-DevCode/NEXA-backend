import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { handleJsonSyntaxError } from "./middleware/jsonErrorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import addressRoutes  from "./routes/addressRoutes.js";
import categoriesRoutes from "./routes/categoriesRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(handleJsonSyntaxError);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/product", productRoutes);

app.use(errorHandler);

export default app;
