import express from "express";
import addressController from "../controllers/addressController.js"

const router = express.Router();

router.post("/", addressController.createAddress);
router.patch("/:id", addressController.updateAddress);



