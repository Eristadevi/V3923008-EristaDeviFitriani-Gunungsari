import express from "express";

import {
  getAdminMapDestinations,
  getAdminMapDestinationDetail,
  addAdminMapDestination,
  editAdminMapDestination,
  deleteAdminMapDestination,
  restoreAdminMapDestination,
} from "../controllers/adminMaps.controller.js";

import { uploadMapImage } from "../middlewares/uploadMapImage.js";

const router = express.Router();

// ADMIN REACT VITE
router.get("/destinations", getAdminMapDestinations);
router.get("/destinations/:id", getAdminMapDestinationDetail);

router.post(
  "/destinations",
  uploadMapImage.single("image"),
  addAdminMapDestination
);

router.put(
  "/destinations/:id",
  uploadMapImage.single("image"),
  editAdminMapDestination
);

router.delete("/destinations/:id", deleteAdminMapDestination);
router.put("/destinations/:id/restore", restoreAdminMapDestination);

export default router;