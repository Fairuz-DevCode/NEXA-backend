import express from "express";

import { verifyAccessToken } from "../middleware/authMiddleware.js";
import controller from "../controllers/categoriesController.js";

const router = express.Router();

router.post("/", verifyAccessToken, controller.createCategories);
router.get("/", controller.getCategories);
router.delete("/:id", verifyAccessToken, controller.deleteCategories);

export default router;