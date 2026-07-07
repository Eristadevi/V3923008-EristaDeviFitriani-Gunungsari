import express from "express";

import {
  buatBookingWisata,
  getRiwayatBookingWisataSaya,
  getDetailBookingWisata,
  sinkronStatusBookingWisata,
} from "../controllers/bookingWisata.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, buatBookingWisata);

router.get("/riwayat-saya", authMiddleware, getRiwayatBookingWisataSaya);

router.post(
  "/sinkron-status/:kodeBooking",
  authMiddleware,
  sinkronStatusBookingWisata
);

router.get("/:kodeBooking", authMiddleware, getDetailBookingWisata);

export default router;