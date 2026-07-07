import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import {
  getAllPaketWisataAdmin,
  getDetailPaketWisataAdmin,
  tambahPaketWisataAdmin,
  editPaketWisataAdmin,
  hapusPaketWisataAdmin,
} from "../controllers/adminPaketWisata.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "paket-wisata");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const filename = `paket-${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar."));
    }

    cb(null, true);
  },
});

const uploadGambarPaket = (req, res, next) => {
  upload.single("gambar")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Ukuran gambar maksimal 5 MB."
            : error.message,
      });
    }

    if (req.file) {
      const gambarPath = `/uploads/paket-wisata/${req.file.filename}`;

      req.body.gambarUrl = gambarPath;
      req.body.gambar_url = gambarPath;
    }

    next();
  });
};

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getAllPaketWisataAdmin
);

router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  getDetailPaketWisataAdmin
);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  uploadGambarPaket,
  tambahPaketWisataAdmin
);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  uploadGambarPaket,
  editPaketWisataAdmin
);

router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  hapusPaketWisataAdmin
);

export default router;