import {
  createBookingWisata,
  getBookingWisataByKode,
  getBookingWisataByUser,
  updateBookingWisata,
} from "../models/bookingWisata.model.js";

import {
  buatTransaksiMidtrans,
  cekStatusMidtrans,
} from "../middlewares/midtransService.js";

const buatKodeBooking = () => {
  return `WST-BOOK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const formatBookingWisata = (item) => {
  return {
    id: item.id,
    userId: item.user_id,

    wisataId: item.wisata_id,
    kodeBooking: item.kode_booking,

    namaWisata: item.nama_wisata,
    category: item.kategori,
    kategori: item.kategori,

    name: item.nama_pengunjung,
    phone: item.nomor_hp,
    date: item.tanggal_kunjungan,
    people: Number(item.jumlah_orang || 0),
    note: item.catatan,

    priceType: item.price_type,
    priceLabel: item.price_label,
    nominalSatuan: Number(item.nominal_satuan || 0),
    totalNominal: Number(item.total_nominal || 0),

    bookingStatus: item.status_booking,
    paymentStatus: item.status_pembayaran,

    paymentMethod: item.metode_pembayaran,
    jenisPembayaran: item.jenis_pembayaran,

    snapToken: item.snap_token,
    redirectUrl: item.redirect_url,

    createdAt: item.created_at,
    updatedAt: item.updated_at,

    kode_booking: item.kode_booking,
    nama_wisata: item.nama_wisata,
    status_booking: item.status_booking,
    status_pembayaran: item.status_pembayaran,
    redirect_url: item.redirect_url,
    total_nominal: item.total_nominal,
    jumlah_orang: item.jumlah_orang,
    tanggal_kunjungan: item.tanggal_kunjungan,
    price_type: item.price_type,
  };
};

export const buatBookingWisata = async (req, res) => {
  try {
    const {
      wisataId,
      wisata_id,
      namaWisata,
      nama_wisata,
      kategori,
      category,
      name,
      phone,
      date,
      people,
      note,
      priceType,
      price_type,
      priceLabel,
      price_label,
      nominalSatuan,
      nominal_satuan,
      paymentMethod,
      metode_pembayaran,
    } = req.body;

    const userId = req.user?.id || req.user?.userId || req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User belum login.",
      });
    }

    const selectedWisataId = wisataId || wisata_id;
    const selectedNamaWisata = namaWisata || nama_wisata;
    const selectedKategori = kategori || category || null;
    const selectedPriceType = priceType || price_type || "free";
    const selectedPriceLabel =
      priceLabel ||
      price_label ||
      (selectedPriceType === "consult"
        ? "Menyesuaikan kebutuhan"
        : selectedPriceType === "paid"
        ? "Berbayar"
        : "Tiket masuk gratis");

    const selectedPaymentMethod = paymentMethod || metode_pembayaran || null;

    if (!selectedWisataId || !selectedNamaWisata || !name || !phone || !date || !people) {
      return res.status(400).json({
        success: false,
        message:
          "wisataId, namaWisata, name, phone, date, dan people wajib diisi.",
      });
    }

    const jumlahOrang = Number(people);

    if (Number.isNaN(jumlahOrang) || jumlahOrang <= 0) {
      return res.status(400).json({
        success: false,
        message: "Jumlah orang harus lebih dari 0.",
      });
    }

    const nominalPerOrang = Number(nominalSatuan || nominal_satuan || 0);

    const isFree = selectedPriceType === "free";
    const isConsult = selectedPriceType === "consult";
    const isPaid = selectedPriceType === "paid";
    const isPayAtLocation = selectedPaymentMethod === "pay_at_location";

    if (!["free", "consult", "paid"].includes(selectedPriceType)) {
      return res.status(400).json({
        success: false,
        message: "priceType tidak valid.",
      });
    }

    let totalNominal = 0;
    let statusBooking = "menunggu_konfirmasi";
    let statusPembayaran = "tidak_perlu";
    let metodePembayaran = null;
    let jenisPembayaran = null;
    let snapToken = null;
    let redirectUrl = null;

    if (isPaid) {
      totalNominal = nominalPerOrang * jumlahOrang;

      if (totalNominal <= 0) {
        return res.status(400).json({
          success: false,
          message: "Nominal wisata berbayar belum valid.",
        });
      }

      metodePembayaran = selectedPaymentMethod || "midtrans";

      if (isPayAtLocation) {
        statusBooking = "menunggu_konfirmasi";
        statusPembayaran = "bayar_di_lokasi";
        jenisPembayaran = "pay_at_location";
      } else {
        statusBooking = "menunggu_pembayaran";
        statusPembayaran = "menunggu";
      }
    }

    if (isFree || isConsult) {
      totalNominal = 0;
      statusBooking = "menunggu_konfirmasi";
      statusPembayaran = "tidak_perlu";
      metodePembayaran = null;
      jenisPembayaran = null;
    }

    const kodeBooking = buatKodeBooking();

    if (isPaid && !isPayAtLocation) {
      const itemPembelian = [
        {
          id: String(selectedWisataId),
          price: nominalPerOrang,
          quantity: jumlahOrang,
          name: selectedNamaWisata,
        },
      ];

      const dataPembeli = {
        nama: name,
        email: req.user?.email || "pengunjung@example.com",
        telepon: phone,
      };

      const transaksiMidtrans = await buatTransaksiMidtrans({
        kodePesanan: kodeBooking,
        nominal: totalNominal,
        dataPembeli,
        itemPembelian,
      });

      snapToken = transaksiMidtrans.snap_token;
      redirectUrl = transaksiMidtrans.redirect_url;
    }

    const booking = await createBookingWisata({
      user_id: userId,

      wisata_id: selectedWisataId,
      kode_booking: kodeBooking,

      nama_wisata: selectedNamaWisata,
      kategori: selectedKategori,

      nama_pengunjung: name,
      nomor_hp: phone,
      tanggal_kunjungan: date,
      jumlah_orang: jumlahOrang,
      catatan: note || "",

      price_type: selectedPriceType,
      price_label: selectedPriceLabel,

      nominal_satuan: nominalPerOrang,
      total_nominal: totalNominal,

      status_booking: statusBooking,
      status_pembayaran: statusPembayaran,

      metode_pembayaran: metodePembayaran,
      jenis_pembayaran: jenisPembayaran,

      snap_token: snapToken,
      redirect_url: redirectUrl,
    });

    let message = "Pengajuan kunjungan berhasil dibuat.";

    if (isFree) {
      message = "Pengajuan kunjungan gratis berhasil dibuat.";
    }

    if (isConsult) {
      message =
        "Pengajuan berhasil dikirim. Admin akan menentukan harga dan metode pembayaran.";
    }

    if (isPaid && !isPayAtLocation) {
      message = "Booking berhasil dibuat. Silakan lanjutkan pembayaran.";
    }

    if (isPaid && isPayAtLocation) {
      message =
        "Booking berhasil dibuat. Pembayaran akan dilakukan langsung di lokasi.";
    }

    return res.status(201).json({
      success: true,
      message,
      data: formatBookingWisata(booking),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat booking wisata.",
      error: error.message,
    });
  }
};

export const getRiwayatBookingWisataSaya = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User belum login.",
      });
    }

    const booking = await getBookingWisataByUser(userId);

    return res.json({
      success: true,
      message: "Riwayat booking wisata berhasil diambil.",
      data: booking.map(formatBookingWisata),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat booking wisata.",
      error: error.message,
    });
  }
};

export const getDetailBookingWisata = async (req, res) => {
  try {
    const { kodeBooking } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?.uid;

    const booking = await getBookingWisataByKode(kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    if (
      booking.user_id &&
      userId &&
      String(booking.user_id) !== String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke booking ini.",
      });
    }

    return res.json({
      success: true,
      message: "Detail booking wisata berhasil diambil.",
      data: formatBookingWisata(booking),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail booking wisata.",
      error: error.message,
    });
  }
};

export const sinkronStatusBookingWisata = async (req, res) => {
  try {
    const { kodeBooking } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?.uid;

    const booking = await getBookingWisataByKode(kodeBooking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking wisata tidak ditemukan.",
      });
    }

    if (
      booking.user_id &&
      userId &&
      String(booking.user_id) !== String(userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki akses ke booking ini.",
      });
    }

    if (!booking.snap_token) {
      return res.json({
        success: true,
        message:
          "Booking ini tidak memiliki transaksi Midtrans yang perlu disinkronkan.",
        data: formatBookingWisata(booking),
      });
    }

    const statusMidtrans = await cekStatusMidtrans(kodeBooking);

    let statusPembayaran = "menunggu";
    let statusBooking = "menunggu_pembayaran";

    if (statusMidtrans.transaction_status === "settlement") {
      statusPembayaran = "dibayar";
      statusBooking = "dikonfirmasi";
    }

    if (
      statusMidtrans.transaction_status === "capture" &&
      statusMidtrans.fraud_status === "accept"
    ) {
      statusPembayaran = "dibayar";
      statusBooking = "dikonfirmasi";
    }

    if (statusMidtrans.transaction_status === "pending") {
      statusPembayaran = "menunggu";
      statusBooking = "menunggu_pembayaran";
    }

    if (statusMidtrans.transaction_status === "expire") {
      statusPembayaran = "kedaluwarsa";
      statusBooking = "dibatalkan";
    }

    if (
      ["deny", "cancel", "failure"].includes(
        statusMidtrans.transaction_status
      )
    ) {
      statusPembayaran = "dibatalkan";
      statusBooking = "dibatalkan";
    }

    const bookingBaru = await updateBookingWisata(kodeBooking, {
      status_pembayaran: statusPembayaran,
      status_booking: statusBooking,
      jenis_pembayaran: statusMidtrans.payment_type || null,
    });

    return res.json({
      success: true,
      message: "Status booking wisata berhasil disinkronkan.",
      data: formatBookingWisata(bookingBaru),
      midtrans: {
        transaction_status: statusMidtrans.transaction_status,
        fraud_status: statusMidtrans.fraud_status || null,
        payment_type: statusMidtrans.payment_type || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyinkronkan status booking wisata.",
      error: error.message,
    });
  }
};