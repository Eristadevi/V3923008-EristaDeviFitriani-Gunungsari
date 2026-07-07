import express from "express";

import {
  getPaketWisata,
  getDetailPaketWisata,
  tambahPaketWisata,
  editPaketWisata,
  hapusPaketWisata,
} from "../controllers/paketWisata.controller.js";

const router = express.Router();

// Ambil semua paket wisata
router.get("/", getPaketWisata);

// Ambil detail paket berdasarkan ID
router.get("/:id", getDetailPaketWisata);

// Tambah paket wisata
// nanti bisa ditambahkan auth admin
router.post("/", tambahPaketWisata);

// Edit paket wisata
// nanti bisa ditambahkan auth admin
router.put("/:id", editPaketWisata);

// Nonaktifkan paket wisata
// nanti bisa ditambahkan auth admin
router.delete("/:id", hapusPaketWisata);

export default router;