import multer, { memoryStorage } from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const uploadDir = "/public/img/products";

if (!fs.existsSync(uploadDir)) {
  fs.mkdir(uploadDir, { recursive: true });
}

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeType = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimeType.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPEG, PNG, or WebP image files are allowed!",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadProductImage = (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ errors: `Multer error, ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) return next();

    try {
      const filename = `product-${Date.now()}.webp`;
      const outputPath = path.join(uploadDir, filename);

      // 4. Pemrosesan Gambar dengan Sharp
      await sharp(req.file.buffer)
        .resize(1000, 1000, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // 5. Menyimpan URL/Path Gambar di Object Request
      req.file.savedPath = `/uploads/products/${filename}`;

      next();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Gagal memproses gambar." });
    }
  });
};
