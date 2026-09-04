import express from "express";

import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { uploadProductImage } from "../middleware/uploadProductImageMiddleware.js";

import controller from "../controllers/productController.js";

const router = express.Router();

router.post("/", verifyAccessToken, uploadProductImage, controller.createProduct);
router.get("/", controller.getProduct);
router.get("/:id", controller.getProductDetail);
router.patch("/:id", verifyAccessToken, uploadProductImage, controller.updateProduct);
router.delete("/:id", verifyAccessToken, controller.deleteProduct);

// Dynamic Catch-All Route for /categories/[category-slug] and /categories/[category-slug]/[product-slug]
router.get("/*slugPath", controller.getBySlugPath);

export default router;
