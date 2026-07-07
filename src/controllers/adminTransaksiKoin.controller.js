// controllers/adminTransaksiKoinController.js

import {
  getAllTransaksiKoin,
  getTransaksiKoinByKodePenukaran,
  tukarKoinByKodePenukaran,
} from "../models/koin.model.js";

export const getAllTransaksiKoinAdmin = async (req, res) => {
  try {
    const transaksi = await getAllTransaksiKoin();

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data transaksi koin",
      data: transaksi,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const cekKodePenukaranKoin = async (req, res) => {
  try {
    const { kode_penukaran } = req.body;

    if (!kode_penukaran) {
      return res.status(400).json({
        success: false,
        message: "Kode penukaran wajib diisi",
      });
    }

    const transaksi = await getTransaksiKoinByKodePenukaran(kode_penukaran);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Kode penukaran tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kode penukaran ditemukan",
      data: transaksi,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const tukarKoinAdmin = async (req, res) => {
  try {
    const { kode_penukaran } = req.body;

    if (!kode_penukaran) {
      return res.status(400).json({
        success: false,
        message: "Kode penukaran wajib diisi",
      });
    }

    const transaksi = await getTransaksiKoinByKodePenukaran(kode_penukaran);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Kode penukaran tidak ditemukan",
      });
    }

    if (transaksi.status !== "dibayar") {
      return res.status(400).json({
        success: false,
        message: "Transaksi belum dibayar, koin tidak bisa ditukar",
        data: transaksi,
      });
    }

    if (transaksi.sudah_ditukar) {
      return res.status(400).json({
        success: false,
        message: "Kode penukaran sudah pernah digunakan",
        data: transaksi,
      });
    }

    const hasilTukar = await tukarKoinByKodePenukaran(kode_penukaran);

    return res.status(200).json({
      success: true,
      message: "Koin berhasil ditukar",
      data: hasilTukar,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};