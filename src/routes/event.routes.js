import express from "express";

import {
  getPublicEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  getPaketOptions,
} from "../controllers/event.controller.js";

import { uploadEventImage } from "..//middlewares/uploadEventImage.js";

const router = express.Router();

// Middleware upload gambar event
// field gambar dari frontend harus bernama: image
const uploadSingleEventImage = (req, res, next) => {
  uploadEventImage.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Gagal upload gambar event.",
      });
    }

    next();
  });
};

// Ambil semua event aktif untuk user/mobile
router.get("/", getPublicEvents);

// Ambil pilihan paket untuk form event
// posisi ini harus di atas "/:id"
router.get("/options/paket", getPaketOptions);

// Ambil detail event berdasarkan ID
router.get("/:id", getEventDetail);

// Tambah event
// nanti bisa ditambahkan auth admin
router.post("/", uploadSingleEventImage, createEvent);

// Edit event
// nanti bisa ditambahkan auth admin
router.put("/:id", uploadSingleEventImage, updateEvent);

// Hapus event
// nanti bisa ditambahkan auth admin
router.delete("/:id", deleteEvent);

export default router;