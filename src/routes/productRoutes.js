import express from "express";

import { verifyAccessToken } from "../middleware/authMiddleware";
import { uploadProductImage } from "../middleware/uploadProductImageMiddleware";

import productController from "../controllers/productController";

const router = express.Router();

router.use(verifyAccessToken);

router.post(
  "/",
  uploadProductImage,
  productController.createProduct,
);
router.get("/", productController.getProduct);
router.patch(
  "/:id",
  uploadProductImage,
  productController.updateProduct,
);
router.delete("/:id", productController.deleteProduct);

export default router;
