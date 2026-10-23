import express from "express";
import { verifyAccessToken } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validateMiddleware.js";
import { idempotency } from "../../middleware/idempotencyMiddleware.js";
import { createOrderSchema } from "./order.validation.js";
import { OrderController } from "./order.controller.js";

const router = express.Router();

router.post("/", verifyAccessToken, idempotency(120), validate(createOrderSchema), OrderController.createOrder);
router.get("/", verifyAccessToken, OrderController.getOrderHistory);
router.get("/:id", verifyAccessToken, OrderController.getOrderDetail);
router.patch("/:id/cancel", verifyAccessToken, OrderController.cancelOrder);

export default router;
