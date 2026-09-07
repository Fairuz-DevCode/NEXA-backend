import express from "express";

import { verifyAccessToken } from "../middleware/authMiddleware.js";
import controller from "../controllers/categoriesController.js";
import { verifyAdmin } from "../middleware/adminMinddleware.js";

const router = express.Router();

router.post("/", verifyAccessToken, verifyAdmin, controller.createCategories);
router.get("/", controller.getCategories);
router.delete("/:id", verifyAccessToken, verifyAdmin, controller.deleteCategories);

export default router;