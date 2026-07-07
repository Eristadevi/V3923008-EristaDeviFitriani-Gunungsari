import express from "express";

import {
  getAllBookingWisataAdmin,
  getDetailBookingWisataAdmin,
  konfirmasiBookingWisataAdmin,
  batalkanBookingWisataAdmin,
  selesaikanBookingWisataAdmin,
  ubahHargaBookingWisataAdmin,
  hapusBookingWisataAdmin,
} from "../controllers/adminBookingWisata.controller.js";

const router = express.Router();

router.get("/", getAllBookingWisataAdmin);

router.get("/:kodeBooking", getDetailBookingWisataAdmin);

router.put("/:kodeBooking/konfirmasi", konfirmasiBookingWisataAdmin);

router.put("/:kodeBooking/batalkan", batalkanBookingWisataAdmin);

router.put("/:kodeBooking/selesai", selesaikanBookingWisataAdmin);

router.put("/:kodeBooking/harga", ubahHargaBookingWisataAdmin);

router.delete("/:kodeBooking", hapusBookingWisataAdmin);

export default router;