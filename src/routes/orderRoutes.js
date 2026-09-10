import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createOrderSchema } from "../validations/orderValidation.js";
import controller from "../controllers/orderController.js";

const router = express.Router();

router.post("/", verifyAccessToken, validate(createOrderSchema), controller.createOrder);
router.get("/", verifyAccessToken, controller.getOrderHistory);
router.get("/:id", verifyAccessToken, controller.getOrderDetail);
router.patch("/:id/cancel", verifyAccessToken, controller.cancelOrder);

export default router;
