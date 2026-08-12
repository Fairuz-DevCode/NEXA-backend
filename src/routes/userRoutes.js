import express from "express";
import { userController } from "../controllers/userController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

router = router.express();
router.get("/me", verifyToken, AuthController.getMe);
