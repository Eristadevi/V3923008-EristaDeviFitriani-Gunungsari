import express from "express";

import {
  buatPembayaranKoin,
  getStatusTransaksiKoin,
  sinkronStatusTransaksiKoin,
  terimaNotifikasiMidtrans,
  getRiwayatTransaksiKoinSaya,
} from "../controllers/koin.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

// membuat transaksi pembayaran koin Pundensari
// wajib login agar user_id tersimpan
router.post("/buat-pembayaran", authMiddleware, buatPembayaranKoin);

// cek status transaksi berdasarkan kode pesanan
// wajib login
router.get("/status/:kodePesanan", authMiddleware, getStatusTransaksiKoin);

// sinkron status transaksi dari Midtrans
// wajib login
router.post(
  "/sinkron-status/:kodePesanan",
  authMiddleware,
  sinkronStatusTransaksiKoin
);

// riwayat transaksi koin user yang login
router.get("/riwayat-saya", authMiddleware, getRiwayatTransaksiKoinSaya);

// menerima notifikasi pembayaran dari Midtrans
// ini jangan diberi authMiddleware karena yang memanggil Midtrans, bukan user
router.post("/midtrans/notifikasi", terimaNotifikasiMidtrans);

export default router;