import express from "express";
import { verifyAccessToken } from "../../middleware/authMiddleware.js";
import { validate } from "../../middleware/validateMiddleware.js";
import { addCartItemSchema, updateCartItemSchema } from "./cart.validation.js";
import { CartController } from "./cart.controller.js";

const router = express.Router();

router.get("/", verifyAccessToken, CartController.getCart);
router.post("/items", verifyAccessToken, validate(addCartItemSchema), CartController.addItem);
router.patch("/items/:id", verifyAccessToken, validate(updateCartItemSchema), CartController.updateItemQuantity);
router.delete("/items/:id", verifyAccessToken, CartController.removeItem);

export default router;
