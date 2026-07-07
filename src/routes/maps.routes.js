import express from "express";

import {
  getMapDestinations,
  getMapDestinationDetail,
  createRouteUrl,
  createRouteDetail,
} from "../controllers/maps.controller.js";

const router = express.Router();

// ===============================
// USER EXPO GO
// ===============================

// ambil semua destinasi maps yang aktif
router.get("/destinations", getMapDestinations);

// ambil detail destinasi berdasarkan id
router.get("/destinations/:id", getMapDestinationDetail);

// buat URL rute Google Maps, keluar aplikasi ke Google Maps
router.post("/route", createRouteUrl);

// buat detail rute untuk ditampilkan di dalam aplikasi
router.post("/route-detail", createRouteDetail);

export default router;