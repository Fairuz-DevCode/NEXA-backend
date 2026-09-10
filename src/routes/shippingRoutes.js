import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { verifyAdmin } from "../middleware/adminMinddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { updateShippingSchema } from "../validations/shippingValidation.js";
import controller from "../controllers/shippingController.js";

const router = express.Router();

router.patch("/order/:orderId", verifyAccessToken, verifyAdmin, validate(updateShippingSchema), controller.updateShipping);
router.get("/order/:orderId", verifyAccessToken, controller.getShipping);
router.patch("/order/:orderId/complete", verifyAccessToken, controller.completeOrder);
router.post("/calculate", controller.calculateCost);

export default router;
