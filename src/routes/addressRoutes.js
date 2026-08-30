import express from "express";
import addressController from "../controllers/addressController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createAddressSchema, updateAddressSchema } from "../validations/addressValidation.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/", validate(createAddressSchema), addressController.createAddress);
router.get("/", addressController.getAddresses);
router.patch("/:id", validate(updateAddressSchema), addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

export default router;
