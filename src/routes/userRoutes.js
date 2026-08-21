import express from "express";
import { UserController } from "../controllers/userController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", verifyAccessToken, UserController.getProfile);
router.patch("/me", verifyAccessToken, UserController.updateProfile);
router.put("/me/change-password", verifyAccessToken, UserController.changePassword);

export default router;
