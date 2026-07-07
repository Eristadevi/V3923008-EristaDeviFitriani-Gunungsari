import {
  getAllPemesananWisata,
  getPemesananWisataByKodePesanan,
  setHargaPemesananWisata,
  konfirmasiPemesananGratis,
  batalkanPemesananWisata,
  selesaikanPemesananWisata,
} from "../models/pemesananWisata.model.js";

import { buatTransaksiMidtrans } from "../middlewares/midtransService.js";

export const getAllPemesananWisataAdmin = async (req, res) => {
  try {
    const pemesanan = await getAllPemesananWisata();

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data pemesanan wisata",
      data: pemesanan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const getDetailPemesananWisataAdmin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil detail pemesanan wisata",
      data: pemesanan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const setHargaPemesananWisataAdmin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;
    const { nominal_satuan, total_nominal, price_label } = req.body;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan",
      });
    }

    if (pemesanan.price_type !== "consult") {
      return res.status(400).json({
        success: false,
        message: "Harga hanya bisa ditentukan untuk paket menyesuaikan kebutuhan",
      });
    }

    if (pemesanan.status_pesanan !== "menunggu_konfirmasi") {
      return res.status(400).json({
        success: false,
        message: "Pemesanan ini sudah diproses",
      });
    }

    const totalNominal = Number(total_nominal || 0);
    const nominalSatuan = Number(nominal_satuan || 0);
    const jumlahOrang = Number(pemesanan.jumlah_orang || 1);

    if (totalNominal <= 0 && nominalSatuan <= 0) {
      return res.status(400).json({
        success: false,
        message: "Harga wajib diisi",
      });
    }

    const totalAkhir =
      totalNominal > 0 ? totalNominal : nominalSatuan * jumlahOrang;

    const transaksiMidtrans = await buatTransaksiMidtrans({
      kodePesanan,
      nominal: totalAkhir,
      dataPembeli: {
        nama: pemesanan.nama_pengunjung,
        email: "pengunjung@example.com",
        telepon: pemesanan.nomor_hp,
      },
      itemPembelian: [
        {
          id: String(pemesanan.paket_id),
          price: totalAkhir,
          quantity: 1,
          name: pemesanan.nama_paket.substring(0, 50),
        },
      ],
    });

    const hasil = await setHargaPemesananWisata(kodePesanan, {
      nominal_satuan: nominalSatuan,
      total_nominal: totalAkhir,
      price_label:
        price_label || `Rp ${totalAkhir.toLocaleString("id-ID")}`,
      metode_pembayaran: "midtrans",
      snap_token: transaksiMidtrans.snap_token,
      redirect_url: transaksiMidtrans.redirect_url,
    });

    return res.status(200).json({
      success: true,
      message: "Harga berhasil ditentukan dan link pembayaran berhasil dibuat",
      data: hasil,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const konfirmasiGratisPemesananWisataAdmin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan",
      });
    }

    if (pemesanan.price_type !== "free") {
      return res.status(400).json({
        success: false,
        message: "Pemesanan ini bukan paket gratis",
      });
    }

    if (pemesanan.status_pesanan === "selesai") {
      return res.status(400).json({
        success: false,
        message: "Pemesanan ini sudah selesai",
      });
    }

    const hasil = await konfirmasiPemesananGratis(kodePesanan);

    return res.status(200).json({
      success: true,
      message: "Pemesanan gratis berhasil dikonfirmasi",
      data: hasil,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const batalkanPemesananWisataAdmin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan",
      });
    }

    if (pemesanan.status_pesanan === "selesai") {
      return res.status(400).json({
        success: false,
        message: "Pemesanan yang sudah selesai tidak bisa dibatalkan",
      });
    }

    const hasil = await batalkanPemesananWisata(kodePesanan);

    return res.status(200).json({
      success: true,
      message: "Pemesanan wisata berhasil dibatalkan",
      data: hasil,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const selesaikanPemesananWisataAdmin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan",
      });
    }

    if (pemesanan.status_pesanan === "selesai") {
      return res.status(400).json({
        success: false,
        message: "Pemesanan ini sudah selesai",
      });
    }

    if (
      pemesanan.status_pesanan !== "dikonfirmasi" &&
      pemesanan.status_pembayaran !== "dibayar" &&
      pemesanan.status_pembayaran !== "tidak_perlu"
    ) {
      return res.status(400).json({
        success: false,
        message: "Pemesanan belum bisa diselesaikan",
      });
    }

    const hasil = await selesaikanPemesananWisata(kodePesanan);

    return res.status(200).json({
      success: true,
      message: "Pemesanan wisata berhasil diselesaikan",
      data: hasil,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};