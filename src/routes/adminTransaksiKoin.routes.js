import express from "express";
import {
  getAllTransaksiKoinAdmin,
  cekKodePenukaranKoin,
  tukarKoinAdmin,
} from "../controllers/adminTransaksiKoin.controller.js";

const router = express.Router();

router.get("/", getAllTransaksiKoinAdmin);
router.post("/cek", cekKodePenukaranKoin);
router.post("/tukar", tukarKoinAdmin);

export default router;