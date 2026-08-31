import { AddressModel } from "../models/addressModel.js";
import stringSimilarity from "string-similarity";

export const checkDuplicateAddress = async (
  req,
  res,
  next,
) => {
  try {
    const userId = req.user.id; // Asumsi ID user didapat dari verifyAccessToken (middleware sebelumnya)
    const { postal_code, street_address } = req.body;

    if (!postal_code || !street_address) {
      return next(); // Kalau kosong, biarkan Zod yang menghandle error formatnya
    }

    // Ambil data alamat lama user dari database
    const existingAddresses =
      await AddressModel.getAddressesByUserId(userId);

    const cleanText = (text) =>
      text
        .toLowerCase()
        .replace(/[.,\/#$%\^&\*;:{}=\-_`~()]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const newPostal = String(postal_code).trim();
    const newStreet = cleanText(street_address);

    for (const existing of existingAddresses) {
      const existingPostal = String(
        existing.postal_code,
      ).trim();

      // Cek apakah postal code sama
      if (newPostal === existingPostal) {
        const existingStreet = cleanText(
          existing.street_address,
        );

        // Hitung kemiripan pakai string-similarity
        const similarity =
          stringSimilarity.compareTwoStrings(
            newStreet,
            existingStreet,
          ) * 100;

        // Jika mirip di atas 80%, gagalkan request
        if (similarity > 80) {
          return res.status(400).json({
            status: "fail",
            message: "Validation failed",
            errors: [
              {
                field: "street_address",
                message: `The address is too similar to an existing record (${similarity.toFixed(1)}% similarity) under the same postal code`,
              },
            ],
          });
        }
      }
    }

    next(); // Lolos, lanjut ke controller
  } catch (error) {
    next(error);
  }
};
