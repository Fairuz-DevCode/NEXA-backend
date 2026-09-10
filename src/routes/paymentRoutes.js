import express from "express";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createPaymentSchema } from "../validations/paymentValidation.js";
import controller from "../controllers/paymentController.js";

const router = express.Router();

router.post("/", verifyAccessToken, validate(createPaymentSchema), controller.createPayment);
router.post("/notification", controller.handleNotification);
router.get("/order/:orderId", verifyAccessToken, controller.getPaymentByOrder);

export default router;
