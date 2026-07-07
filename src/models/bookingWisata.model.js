import { db } from "../core/config/knex.js";

const bookingWisataColumns = [
  "id",
  "user_id",
  "wisata_id",
  "kode_booking",
  "nama_wisata",
  "kategori",
  "nama_pengunjung",
  "nomor_hp",
  "tanggal_kunjungan",
  "jumlah_orang",
  "catatan",
  "price_type",
  "price_label",
  "nominal_satuan",
  "total_nominal",
  "status_booking",
  "status_pembayaran",
  "metode_pembayaran",
  "jenis_pembayaran",
  "snap_token",
  "redirect_url",
  "created_at",
  "updated_at",
];

export const createBookingWisata = async (data) => {
  const [id] = await db("booking_wisata").insert({
    user_id: data.user_id || null,
    wisata_id: data.wisata_id || null,
    kode_booking: data.kode_booking,

    nama_wisata: data.nama_wisata,
    kategori: data.kategori || null,

    nama_pengunjung: data.nama_pengunjung,
    nomor_hp: data.nomor_hp,
    tanggal_kunjungan: data.tanggal_kunjungan,
    jumlah_orang: data.jumlah_orang,
    catatan: data.catatan || null,

    price_type: data.price_type || "free",
    price_label: data.price_label || "Tiket masuk gratis",
    nominal_satuan: data.nominal_satuan || 0,
    total_nominal: data.total_nominal || 0,

    status_booking: data.status_booking || "menunggu_konfirmasi",
    status_pembayaran: data.status_pembayaran || "tidak_perlu",

    metode_pembayaran: data.metode_pembayaran || null,
    jenis_pembayaran: data.jenis_pembayaran || null,
    snap_token: data.snap_token || null,
    redirect_url: data.redirect_url || null,
  });

  return await getBookingWisataById(id);
};

export const getBookingWisataById = async (id) => {
  return await db("booking_wisata")
    .select(bookingWisataColumns)
    .where("id", id)
    .first();
};

export const getBookingWisataByKode = async (kodeBooking) => {
  return await db("booking_wisata")
    .select(bookingWisataColumns)
    .where("kode_booking", kodeBooking)
    .first();
};

export const getAllBookingWisata = async () => {
  return await db("booking_wisata")
    .select(bookingWisataColumns)
    .orderBy("created_at", "desc");
};

export const getBookingWisataByUser = async (userId) => {
  return await db("booking_wisata")
    .select(bookingWisataColumns)
    .where("user_id", userId)
    .orderBy("created_at", "desc");
};

export const getBookingWisataMenungguKonfirmasi = async () => {
  return await db("booking_wisata")
    .select(bookingWisataColumns)
    .where("status_booking", "menunggu_konfirmasi")
    .orderBy("created_at", "desc");
};

export const updateBookingWisata = async (kodeBooking, data) => {
  const payload = {
    updated_at: db.fn.now(),
  };

  if (data.nama_pengunjung !== undefined) payload.nama_pengunjung = data.nama_pengunjung;
  if (data.nomor_hp !== undefined) payload.nomor_hp = data.nomor_hp;
  if (data.tanggal_kunjungan !== undefined) payload.tanggal_kunjungan = data.tanggal_kunjungan;
  if (data.jumlah_orang !== undefined) payload.jumlah_orang = data.jumlah_orang;
  if (data.catatan !== undefined) payload.catatan = data.catatan;

  if (data.price_type !== undefined) payload.price_type = data.price_type;
  if (data.price_label !== undefined) payload.price_label = data.price_label;
  if (data.nominal_satuan !== undefined) payload.nominal_satuan = data.nominal_satuan;
  if (data.total_nominal !== undefined) payload.total_nominal = data.total_nominal;

  if (data.status_booking !== undefined) payload.status_booking = data.status_booking;
  if (data.status_pembayaran !== undefined) payload.status_pembayaran = data.status_pembayaran;

  if (data.metode_pembayaran !== undefined) payload.metode_pembayaran = data.metode_pembayaran;
  if (data.jenis_pembayaran !== undefined) payload.jenis_pembayaran = data.jenis_pembayaran;
  if (data.snap_token !== undefined) payload.snap_token = data.snap_token;
  if (data.redirect_url !== undefined) payload.redirect_url = data.redirect_url;

  await db("booking_wisata")
    .where("kode_booking", kodeBooking)
    .update(payload);

  return await getBookingWisataByKode(kodeBooking);
};

export const konfirmasiBookingWisata = async (kodeBooking) => {
  return await updateBookingWisata(kodeBooking, {
    status_booking: "dikonfirmasi",
  });
};

export const batalkanBookingWisata = async (kodeBooking) => {
  return await updateBookingWisata(kodeBooking, {
    status_booking: "dibatalkan",
    status_pembayaran: "dibatalkan",
  });
};

export const selesaikanBookingWisata = async (kodeBooking) => {
  return await updateBookingWisata(kodeBooking, {
    status_booking: "selesai",
  });
};

export const setHargaBookingWisata = async (kodeBooking, data) => {
  return await updateBookingWisata(kodeBooking, {
    price_type: "paid",
    price_label: data.price_label || "Harga disesuaikan",
    nominal_satuan: data.nominal_satuan || 0,
    total_nominal: data.total_nominal || 0,

    status_booking: data.status_booking,
    status_pembayaran: data.status_pembayaran,

    metode_pembayaran: data.metode_pembayaran || null,
    jenis_pembayaran: data.jenis_pembayaran || null,
    snap_token: data.snap_token || null,
    redirect_url: data.redirect_url || null,
  });
};

export const deleteBookingWisata = async (kodeBooking) => {
  return await db("booking_wisata")
    .where("kode_booking", kodeBooking)
    .del();
};