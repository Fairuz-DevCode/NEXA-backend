import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { addCartItemSchema, updateCartItemSchema } from "../validations/cartValidation.js";
import controller from "../controllers/cartController.js";

const router = express.Router();

router.get("/", verifyAccessToken, controller.getCart);
router.post("/items", verifyAccessToken, validate(addCartItemSchema), controller.addItem);
router.patch("/items/:id", verifyAccessToken, validate(updateCartItemSchema), controller.updateItemQuantity);
router.delete("/items/:id", verifyAccessToken, controller.removeItem);

export default router;
