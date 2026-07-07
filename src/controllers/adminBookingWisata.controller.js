import {
  getAllBookingWisata,
  getBookingWisataByKode,
  konfirmasiBookingWisata,
  batalkanBookingWisata,
  selesaikanBookingWisata,
  setHargaBookingWisata,
  deleteBookingWisata,
} from "../models/bookingWisata.model.js";

import { buatTransaksiMidtrans } from "../middlewares/midtransService.js";

export const getAllBookingWisataAdmin = async (req, res) => {
  try {
    const data = await getAllBookingWisata();

    return res.status(200).json({
      success: true,
      message: "Data booking wisata berhasil diambil.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data booking wisata.",
      error: error.message,
    });
  }
};

export const getDetailBookingWisataAdmin = async (req, res) => {
  try {
    const booking = await getBookingWisataByKode(req.params.kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail booking wisata berhasil diambil.",
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail booking wisata.",
      error: error.message,
    });
  }
};

export const konfirmasiBookingWisataAdmin = async (req, res) => {
  try {
    const booking = await getBookingWisataByKode(req.params.kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    if (booking.status_booking === "selesai") {
      return res.status(400).json({
        success: false,
        message: "Booking ini sudah selesai.",
      });
    }

    if (
      booking.price_type === "paid" &&
      booking.status_pembayaran === "menunggu"
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking berbayar online belum dibayar.",
      });
    }

    const updated = await konfirmasiBookingWisata(req.params.kodeBooking);

    return res.status(200).json({
      success: true,
      message: "Booking wisata berhasil dikonfirmasi.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengonfirmasi booking wisata.",
      error: error.message,
    });
  }
};

export const ubahHargaBookingWisataAdmin = async (req, res) => {
  try {
    const { kodeBooking } = req.params;

    const nominalSatuan = Number(
      req.body.nominalSatuan || req.body.nominal_satuan || 0
    );

    const metodePembayaran =
      req.body.metodePembayaran ||
      req.body.metode_pembayaran ||
      "midtrans";

    const booking = await getBookingWisataByKode(kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    if (booking.price_type !== "consult") {
      return res.status(400).json({
        success: false,
        message: "Harga hanya bisa diset untuk booking menyesuaikan.",
      });
    }

    if (booking.status_booking !== "menunggu_konfirmasi") {
      return res.status(400).json({
        success: false,
        message: "Booking ini sudah diproses.",
      });
    }

    if (nominalSatuan <= 0) {
      return res.status(400).json({
        success: false,
        message: "Nominal harus lebih dari 0.",
      });
    }

    const jumlahOrang = Number(booking.jumlah_orang || 1);
    const totalNominal = nominalSatuan * jumlahOrang;

    const priceLabel =
      req.body.priceLabel ||
      req.body.price_label ||
      `Rp ${nominalSatuan.toLocaleString("id-ID")} / orang`;

    if (metodePembayaran === "pay_at_location") {
      const hasil = await setHargaBookingWisata(kodeBooking, {
        price_label: priceLabel,
        nominal_satuan: nominalSatuan,
        total_nominal: totalNominal,
        status_booking: "dikonfirmasi",
        status_pembayaran: "bayar_di_lokasi",
        metode_pembayaran: "pay_at_location",
        jenis_pembayaran: "pay_at_location",
        snap_token: null,
        redirect_url: null,
      });

      return res.status(200).json({
        success: true,
        message: "Harga berhasil diset. Pembayaran dilakukan di lokasi.",
        data: hasil,
      });
    }

    const transaksiMidtrans = await buatTransaksiMidtrans({
      kodePesanan: kodeBooking,
      nominal: totalNominal,
      dataPembeli: {
        nama: booking.nama_pengunjung,
        email: "pengunjung@example.com",
        telepon: booking.nomor_hp,
      },
      itemPembelian: [
        {
          id: String(booking.wisata_id || booking.id),
          price: totalNominal,
          quantity: 1,
          name: booking.nama_wisata.substring(0, 50),
        },
      ],
    });

    const hasil = await setHargaBookingWisata(kodeBooking, {
      price_label: priceLabel,
      nominal_satuan: nominalSatuan,
      total_nominal: totalNominal,
      status_booking: "menunggu_pembayaran",
      status_pembayaran: "menunggu",
      metode_pembayaran: "midtrans",
      jenis_pembayaran: null,
      snap_token: transaksiMidtrans.snap_token,
      redirect_url: transaksiMidtrans.redirect_url,
    });

    return res.status(200).json({
      success: true,
      message: "Harga berhasil diset dan link pembayaran Midtrans berhasil dibuat.",
      data: hasil,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengubah harga booking wisata.",
      error: error.message,
    });
  }
};

export const batalkanBookingWisataAdmin = async (req, res) => {
  try {
    const booking = await getBookingWisataByKode(req.params.kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    if (booking.status_booking === "selesai") {
      return res.status(400).json({
        success: false,
        message: "Booking yang sudah selesai tidak bisa dibatalkan.",
      });
    }

    const updated = await batalkanBookingWisata(req.params.kodeBooking);

    return res.status(200).json({
      success: true,
      message: "Booking wisata berhasil dibatalkan.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membatalkan booking wisata.",
      error: error.message,
    });
  }
};

export const selesaikanBookingWisataAdmin = async (req, res) => {
  try {
    const booking = await getBookingWisataByKode(req.params.kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    if (booking.status_booking === "selesai") {
      return res.status(400).json({
        success: false,
        message: "Booking ini sudah selesai.",
      });
    }

    if (
      booking.status_booking !== "dikonfirmasi" &&
      booking.status_pembayaran !== "dibayar" &&
      booking.status_pembayaran !== "tidak_perlu" &&
      booking.status_pembayaran !== "bayar_di_lokasi"
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking belum bisa diselesaikan.",
      });
    }

    const updated = await selesaikanBookingWisata(req.params.kodeBooking);

    return res.status(200).json({
      success: true,
      message: "Booking wisata berhasil diselesaikan.",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyelesaikan booking wisata.",
      error: error.message,
    });
  }
};

export const hapusBookingWisataAdmin = async (req, res) => {
  try {
    const booking = await getBookingWisataByKode(req.params.kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    await deleteBookingWisata(req.params.kodeBooking);

    return res.status(200).json({
      success: true,
      message: "Booking wisata berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus booking wisata.",
      error: error.message,
    });
  }
};