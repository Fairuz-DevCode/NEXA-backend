import express from "express";
import addressController from "../controllers/addressController.js";
import { verifyAccessToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";
import { createAddressSchema, updateAddressSchema } from "../validations/addressValidation.js";
import { checkDuplicateAddress } from "../middleware/validateAddressMiddleware.js";

const router = express.Router();

router.use(verifyAccessToken);

router.post("/", validate(createAddressSchema), checkDuplicateAddress, addressController.createAddress);
router.get("/", addressController.getAddresses);
router.patch("/:id", validate(updateAddressSchema), checkDuplicateAddress, addressController.updateAddress);
router.delete("/:id", addressController.deleteAddress);

export default router;
