import express from "express";

import {
  getAdminEvents,
  getEventDetail,
  createEvent,
  updateEvent,
  deleteEvent,
  getPaketOptions,
} from "../controllers/event.controller.js";

import { uploadEventImage } from "../middlewares/uploadEventImage.js";

const router = express.Router();

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

// Ambil semua event untuk admin
router.get("/", getAdminEvents);

// Ambil pilihan paket untuk dropdown admin
router.get("/options/paket", getPaketOptions);

// Ambil detail event
router.get("/:id", getEventDetail);

// Tambah event
router.post("/", uploadSingleEventImage, createEvent);

// Edit event
router.put("/:id", uploadSingleEventImage, updateEvent);

// Hapus event
router.delete("/:id", deleteEvent);

export default router;