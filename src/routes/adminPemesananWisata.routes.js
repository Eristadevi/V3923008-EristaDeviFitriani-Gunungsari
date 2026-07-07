import express from "express";
import {
  getAllPemesananWisataAdmin,
  getDetailPemesananWisataAdmin,
  setHargaPemesananWisataAdmin,
  konfirmasiGratisPemesananWisataAdmin,
  batalkanPemesananWisataAdmin,
  selesaikanPemesananWisataAdmin,
} from "../controllers/adminPemesananWisata.controller.js";

const router = express.Router();

router.get("/", getAllPemesananWisataAdmin);
router.get("/:kodePesanan", getDetailPemesananWisataAdmin);

router.put("/:kodePesanan/set-harga", setHargaPemesananWisataAdmin);
router.put("/:kodePesanan/konfirmasi-gratis", konfirmasiGratisPemesananWisataAdmin);
router.put("/:kodePesanan/selesai", selesaikanPemesananWisataAdmin);

router.delete("/:kodePesanan", batalkanPemesananWisataAdmin);

export default router;