import express from "express";

import {
  buatPemesananWisata,
  getSemuaPemesananWisata,
  getStatusPemesananWisata,
  getRiwayatPemesananWisataSaya,
  sinkronStatusPemesananWisata,
  terimaNotifikasiMidtransWisata,
} from "../controllers/pemesananWisata.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/buat", authMiddleware, buatPemesananWisata);

router.get("/", getSemuaPemesananWisata);

router.get(
  "/riwayat-saya",
  authMiddleware,
  getRiwayatPemesananWisataSaya
);

router.get("/status/:kodePesanan", getStatusPemesananWisata);

router.post(
  "/sinkron-status/:kodePesanan",
  sinkronStatusPemesananWisata
);

router.post(
  "/midtrans/notifikasi",
  terimaNotifikasiMidtransWisata
);

export default router;