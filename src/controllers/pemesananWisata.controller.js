import {
  createPemesananWisata,
  getPemesananWisataByKodePesanan,
  getAllPemesananWisata,
  updatePemesananWisata,
  getPemesananWisataByUser,
} from "../models/pemesananWisata.model.js";

import { getPaketWisataById } from "../models/paketWisata.model.js";

import {
  buatTransaksiMidtrans,
  cekStatusMidtrans,
  prosesNotifikasiMidtrans,
} from "../middlewares/midtransService.js";

const buatKodePesanan = () => {
  return `WST-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const formatPemesananWisata = (item) => {
  return {
    id: item.id,
    userId: item.user_id,

    paketId: item.paket_id,
    kodePesanan: item.kode_pesanan,

    paketTitle: item.nama_paket,
    category: item.kategori,

    name: item.nama_pengunjung,
    phone: item.nomor_hp,
    date: item.tanggal_kunjungan,
    people: Number(item.jumlah_orang),
    note: item.catatan,

    priceType: item.price_type,
    priceLabel: item.price_label,
    nominalSatuan: Number(item.nominal_satuan || 0),
    totalNominal: Number(item.total_nominal || 0),

    bookingStatus: item.status_pesanan,
    paymentStatus: item.status_pembayaran,

    paymentMethod: item.metode_pembayaran,
    jenisPembayaran: item.jenis_pembayaran,

    snapToken: item.snap_token,
    redirectUrl: item.redirect_url,

    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

export const buatPemesananWisata = async (req, res) => {
  try {
    const {
      paketId,
      packageId,
      name,
      phone,
      date,
      people,
      note,
      paymentMethod,
    } = req.body;

    const selectedPaketId = paketId || packageId;

    if (!selectedPaketId || !name || !phone || !date || !people) {
      return res.status(400).json({
        success: false,
        message: "paketId, name, phone, date, dan people wajib diisi.",
      });
    }

    const jumlahOrang = Number(people);

    if (Number.isNaN(jumlahOrang) || jumlahOrang <= 0) {
      return res.status(400).json({
        success: false,
        message: "Jumlah orang harus lebih dari 0.",
      });
    }

    const paket = await getPaketWisataById(selectedPaketId);

    if (!paket || !paket.aktif) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan atau tidak aktif.",
      });
    }

    const isPaidPackage = paket.price_type === "paid";
    const isFreePackage = paket.price_type === "free";
    const isConsultPackage = paket.price_type === "consult";
    const isPayAtLocation = paymentMethod === "pay_at_location";

    if (isPaidPackage && !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Metode pembayaran wajib dipilih untuk paket berbayar.",
      });
    }

    const nominalSatuan = Number(paket.nominal || 0);
    const totalNominal = isPaidPackage ? nominalSatuan * jumlahOrang : 0;

    if (isPaidPackage && !isPayAtLocation && totalNominal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Nominal paket berbayar belum valid.",
      });
    }

    const kodePesanan = buatKodePesanan();

    let snapToken = null;
    let redirectUrl = null;

    let statusPesanan = "menunggu_konfirmasi";
    let statusPembayaran = "tidak_perlu";

    if (isPaidPackage) {
      statusPesanan = isPayAtLocation
        ? "menunggu_konfirmasi"
        : "menunggu_pembayaran";

      statusPembayaran = isPayAtLocation ? "menunggu" : "menunggu";
    }

    if (isPaidPackage && !isPayAtLocation) {
      const itemPembelian = [
        {
          id: paket.kode_paket,
          price: nominalSatuan,
          quantity: jumlahOrang,
          name: paket.nama_paket,
        },
      ];

      const dataPembeli = {
        nama: name,
        email: req.user?.email || "pengunjung@example.com",
        telepon: phone,
      };

      const transaksiMidtrans = await buatTransaksiMidtrans({
        kodePesanan,
        nominal: totalNominal,
        dataPembeli,
        itemPembelian,
      });

      snapToken = transaksiMidtrans.snap_token;
      redirectUrl = transaksiMidtrans.redirect_url;
    }

    const pemesanan = await createPemesananWisata({
      user_id: req.user?.id || null,

      paket_id: paket.id,
      kode_pesanan: kodePesanan,

      nama_paket: paket.nama_paket,
      kategori: paket.kategori,

      nama_pengunjung: name,
      nomor_hp: phone,
      tanggal_kunjungan: date,
      jumlah_orang: jumlahOrang,
      catatan: note || "",

      price_type: paket.price_type,
      price_label: paket.price_label,

      nominal_satuan: nominalSatuan,
      total_nominal: totalNominal,

      status_pesanan: statusPesanan,
      status_pembayaran: statusPembayaran,

      metode_pembayaran: isPaidPackage ? paymentMethod : null,
      jenis_pembayaran: null,

      snap_token: snapToken,
      redirect_url: redirectUrl,
    });

    let message = "Pengajuan kunjungan berhasil dibuat.";

    if (isPaidPackage && !isPayAtLocation) {
      message = "Pemesanan berhasil dibuat. Silakan lanjutkan pembayaran.";
    }

    if (isPaidPackage && isPayAtLocation) {
      message =
        "Pemesanan berhasil dibuat. Pembayaran akan dilakukan di lokasi.";
    }

    if (isFreePackage) {
      message = "Pendaftaran kunjungan gratis berhasil dibuat.";
    }

    if (isConsultPackage) {
      message =
        "Pengajuan berhasil dikirim. Admin akan mengonfirmasi harga dan jadwal.";
    }

    return res.status(201).json({
      success: true,
      message,
      data: formatPemesananWisata(pemesanan),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat pemesanan wisata.",
      error: error.message,
    });
  }
};

export const getSemuaPemesananWisata = async (req, res) => {
  try {
    const pemesanan = await getAllPemesananWisata();

    return res.json({
      success: true,
      message: "Data pemesanan wisata berhasil diambil.",
      data: pemesanan.map(formatPemesananWisata),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data pemesanan wisata.",
      error: error.message,
    });
  }
};

export const getStatusPemesananWisata = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Status pemesanan wisata berhasil diambil.",
      data: formatPemesananWisata(pemesanan),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil status pemesanan wisata.",
      error: error.message,
    });
  }
};

export const getRiwayatPemesananWisataSaya = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User belum login.",
      });
    }

    const pemesanan = await getPemesananWisataByUser(userId);

    return res.json({
      success: true,
      message: "Riwayat pemesanan wisata berhasil diambil.",
      data: pemesanan.map(formatPemesananWisata),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat pemesanan wisata.",
      error: error.message,
    });
  }
};

export const sinkronStatusPemesananWisata = async (req, res) => {
  try {
    const { kodePesanan } = req.params;

    const pemesanan = await getPemesananWisataByKodePesanan(kodePesanan);

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan.",
      });
    }

    if (!pemesanan.snap_token) {
      return res.json({
        success: true,
        message:
          "Pemesanan ini tidak memiliki transaksi Midtrans yang perlu disinkronkan.",
        data: formatPemesananWisata(pemesanan),
      });
    }

    const statusMidtrans = await cekStatusMidtrans(kodePesanan);

    let statusPembayaran = "menunggu";
    let statusPesanan = "menunggu_pembayaran";

    if (statusMidtrans.transaction_status === "settlement") {
      statusPembayaran = "dibayar";
      statusPesanan = "dikonfirmasi";
    }

    if (
      statusMidtrans.transaction_status === "capture" &&
      statusMidtrans.fraud_status === "accept"
    ) {
      statusPembayaran = "dibayar";
      statusPesanan = "dikonfirmasi";
    }

    if (statusMidtrans.transaction_status === "expire") {
      statusPembayaran = "kedaluwarsa";
      statusPesanan = "dibatalkan";
    }

    if (
      ["deny", "cancel", "failure"].includes(statusMidtrans.transaction_status)
    ) {
      statusPembayaran = "dibatalkan";
      statusPesanan = "dibatalkan";
    }

    const pemesananBaru = await updatePemesananWisata(kodePesanan, {
      status_pembayaran: statusPembayaran,
      status_pesanan: statusPesanan,
      jenis_pembayaran: statusMidtrans.payment_type || null,
    });

    return res.json({
      success: true,
      message: "Status pemesanan wisata berhasil disinkronkan.",
      data: formatPemesananWisata(pemesananBaru),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyinkronkan status pemesanan wisata.",
      error: error.message,
    });
  }
};

export const terimaNotifikasiMidtransWisata = async (req, res) => {
  try {
    const hasil = await prosesNotifikasiMidtrans(req.body);

    const pemesanan = await getPemesananWisataByKodePesanan(
      hasil.kodePesanan
    );

    if (!pemesanan) {
      return res.status(404).json({
        success: false,
        message: "Pemesanan wisata tidak ditemukan.",
      });
    }

    let statusPesanan = pemesanan.status_pesanan;

    if (hasil.status === "dibayar") {
      statusPesanan = "dikonfirmasi";
    }

    if (hasil.status === "menunggu") {
      statusPesanan = "menunggu_pembayaran";
    }

    if (["dibatalkan", "kedaluwarsa"].includes(hasil.status)) {
      statusPesanan = "dibatalkan";
    }

    const pemesananBaru = await updatePemesananWisata(hasil.kodePesanan, {
      status_pembayaran: hasil.status,
      status_pesanan: statusPesanan,
      jenis_pembayaran: hasil.jenisPembayaran || null,
    });

    return res.json({
      success: true,
      message: "Notifikasi Midtrans wisata berhasil diproses.",
      data: formatPemesananWisata(pemesananBaru),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses notifikasi Midtrans wisata.",
      error: error.message,
    });
  }
};