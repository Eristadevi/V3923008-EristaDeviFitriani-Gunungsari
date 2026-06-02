import express from "express";

import {
  getMapDestinations,
  getMapDestinationDetail,
  addMapDestination,
  editMapDestination,
  removeMapDestination,
  createRouteUrl,
  createRouteDetail,
} from "../controllers/maps.controller.js";

const router = express.Router();

// ambil semua destinasi maps
router.get("/destinations", getMapDestinations);

// ambil detail destinasi berdasarkan id
router.get("/destinations/:id", getMapDestinationDetail);

// tambah destinasi maps dari Postman/admin
router.post("/destinations", addMapDestination);

// edit destinasi maps
router.put("/destinations/:id", editMapDestination);

// hapus destinasi maps
router.delete("/destinations/:id", removeMapDestination);

// buat URL rute Google Maps, keluar aplikasi ke Google Maps
router.post("/route", createRouteUrl);

// buat detail rute untuk ditampilkan di dalam aplikasi
router.post("/route-detail", createRouteDetail);

export default router;