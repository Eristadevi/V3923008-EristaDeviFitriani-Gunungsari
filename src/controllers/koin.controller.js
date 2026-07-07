import crypto from "crypto";

import {
  createTransaksiKoin,
  getTransaksiKoinByKodePesanan,
  updateTransaksiKoin,
  getRiwayatTransaksiKoinByUser,
} from "../models/koin.model.js";

import {
  buatTransaksiMidtrans,
  cekStatusMidtrans,
  prosesNotifikasiMidtrans,
} from "../middlewares/midtransService.js";

const nominalDiizinkan = [5000, 10000, 20000, 30000, 50000, 100000];

const formatTransaksiKoin = (item) => {
  return {
    id: item.id,
    userId: item.user_id,
    kodePesanan: item.kode_pesanan,
    nominal: Number(item.nominal),
    status: item.status,
    jenisPembayaran: item.jenis_pembayaran,
    snapToken: item.snap_token,
    redirectUrl: item.redirect_url,
    kodePenukaran: item.kode_penukaran,
    sudahDitukar: Boolean(item.sudah_ditukar),
    waktuDitukar: item.waktu_ditukar,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

const buatKodePesanan = () => {
  return `KOIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const buatKodePenukaran = () => {
  return `KP-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
};

export const buatPembayaranKoin = async (req, res) => {
  try {
    const { nominal } = req.body;

    const nominalNumber = Number(nominal);

    if (!nominal) {
      return res.status(400).json({
        success: false,
        message: "Nominal koin wajib diisi.",
      });
    }

    if (!nominalDiizinkan.includes(nominalNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Nominal koin harus 5000, 10000, 20000, 30000, 50000, atau 100000.",
      });
    }

    const kodePesanan = buatKodePesanan();

    const itemPembelian = [
      {
        id: `KOIN-${nominalNumber}`,
        price: nominalNumber,
        quantity: 1,
        name: `Koin Pundensari Rp ${nominalNumber.toLocaleString("id-ID")}`,
      },
    ];

    const dataPembeli = {
      nama: req.user?.nama || req.user?.name || "Pengunjung",
      email: req.user?.email || "pengunjung@example.com",
      telepon: req.user?.telepon || req.user?.phone || "080000000000",
    };

    const transaksiMidtrans = await buatTransaksiMidtrans({
      kodePesanan,
      nominal: nominalNumber,
      dataPembeli,
      itemPembelian,
    });

    const transaksi = await createTransaksiKoin({
      user_id: req.user?.id || null,
      kode_pesanan: kodePesanan,
      nominal: nominalNumber,
      status: "menunggu",
      snap_token: transaksiMidtrans.snap_token,
      redirect_url: transaksiMidtrans.redirect_url,
    });

    return res.status(201).json({
      success: true,
      message: "Transaksi koin berhasil dibuat.",
      data: formatTransaksiKoin(transaksi),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat transaksi koin.",
      error: error.message,
    });
  }
};

export const getStatusTransaksiKoin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const transaksi = await getTransaksiKoinByKodePesanan(kodePesanan);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi koin tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Status transaksi koin berhasil diambil.",
      data: formatTransaksiKoin(transaksi),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil status transaksi koin.",
      error: error.message,
    });
  }
};

export const sinkronStatusTransaksiKoin = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const transaksi = await getTransaksiKoinByKodePesanan(kodePesanan);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi koin tidak ditemukan.",
      });
    }

    const statusMidtrans = await cekStatusMidtrans(kodePesanan);

    let status = "menunggu";

    if (statusMidtrans.transaction_status === "settlement") {
      status = "dibayar";
    }

    if (
      statusMidtrans.transaction_status === "capture" &&
      statusMidtrans.fraud_status === "accept"
    ) {
      status = "dibayar";
    }

    if (statusMidtrans.transaction_status === "expire") {
      status = "kedaluwarsa";
    }

    if (
      ["deny", "cancel", "failure"].includes(statusMidtrans.transaction_status)
    ) {
      status = "dibatalkan";
    }

    const dataUpdate = {
      status,
      jenis_pembayaran: statusMidtrans.payment_type || null,
      updated_at: new Date(),
    };

    if (status === "dibayar" && !transaksi.kode_penukaran) {
      dataUpdate.kode_penukaran = buatKodePenukaran();
    }

    const transaksiBaru = await updateTransaksiKoin(kodePesanan, dataUpdate);

    return res.json({
      success: true,
      message: "Status transaksi koin berhasil disinkronkan.",
      data: formatTransaksiKoin(transaksiBaru),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyinkronkan status transaksi koin.",
      error: error.message,
    });
  }
};

export const terimaNotifikasiMidtrans = async (req, res) => {
  try {
    const hasil = await prosesNotifikasiMidtrans(req.body);

    const transaksi = await getTransaksiKoinByKodePesanan(hasil.kodePesanan);

    if (!transaksi) {
      return res.status(404).json({
        success: false,
        message: "Transaksi koin tidak ditemukan.",
      });
    }

    const dataUpdate = {
      status: hasil.status,
      jenis_pembayaran: hasil.jenisPembayaran || null,
      updated_at: new Date(),
    };

    if (hasil.status === "dibayar" && !transaksi.kode_penukaran) {
      dataUpdate.kode_penukaran = buatKodePenukaran();
    }

    const transaksiBaru = await updateTransaksiKoin(
      hasil.kodePesanan,
      dataUpdate
    );

    return res.json({
      success: true,
      message: "Notifikasi Midtrans berhasil diproses.",
      data: formatTransaksiKoin(transaksiBaru),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses notifikasi Midtrans.",
      error: error.message,
    });
  }
};

export const getRiwayatTransaksiKoinSaya = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User belum login.",
      });
    }

    const transaksi = await getRiwayatTransaksiKoinByUser(userId);

    return res.json({
      success: true,
      message: "Riwayat transaksi koin berhasil diambil.",
      data: transaksi.map(formatTransaksiKoin),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat transaksi koin.",
      error: error.message,
    });
  }
};