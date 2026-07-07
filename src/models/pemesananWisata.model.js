import { db } from "../core/config/knex.js";

const pemesananWisataColumns = [
  "id",
  "user_id",
  "paket_id",
  "kode_pesanan",
  "nama_paket",
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
  "status_pesanan",
  "status_pembayaran",
  "metode_pembayaran",
  "jenis_pembayaran",
  "snap_token",
  "redirect_url",
  "created_at",
  "updated_at",
];

export const createPemesananWisata = async (data) => {
  const [id] = await db("pemesanan_wisata").insert({
    user_id: data.user_id || null,
    paket_id: data.paket_id,
    kode_pesanan: data.kode_pesanan,

    nama_paket: data.nama_paket,
    kategori: data.kategori || null,

    nama_pengunjung: data.nama_pengunjung,
    nomor_hp: data.nomor_hp,
    tanggal_kunjungan: data.tanggal_kunjungan,
    jumlah_orang: data.jumlah_orang,
    catatan: data.catatan || null,

    price_type: data.price_type,
    price_label: data.price_label,
    nominal_satuan: data.nominal_satuan || 0,
    total_nominal: data.total_nominal || 0,

    status_pesanan: data.status_pesanan || "menunggu_konfirmasi",
    status_pembayaran: data.status_pembayaran || "tidak_perlu",

    metode_pembayaran: data.metode_pembayaran || null,
    jenis_pembayaran: data.jenis_pembayaran || null,
    snap_token: data.snap_token || null,
    redirect_url: data.redirect_url || null,
  });

  return await getPemesananWisataById(id);
};

export const getPemesananWisataById = async (id) => {
  return await db("pemesanan_wisata")
    .select(pemesananWisataColumns)
    .where("id", id)
    .first();
};

export const getPemesananWisataByKodePesanan = async (kodePesanan) => {
  return await db("pemesanan_wisata")
    .select(pemesananWisataColumns)
    .where("kode_pesanan", kodePesanan)
    .first();
};

export const getAllPemesananWisata = async () => {
  return await db("pemesanan_wisata")
    .select(pemesananWisataColumns)
    .orderBy("created_at", "desc");
};

export const getPemesananWisataByUser = async (userId) => {
  return await db("pemesanan_wisata")
    .select(pemesananWisataColumns)
    .where("user_id", userId)
    .orderBy("created_at", "desc");
};

export const getPemesananWisataMenungguKonfirmasi = async () => {
  return await db("pemesanan_wisata")
    .select(pemesananWisataColumns)
    .where("status_pesanan", "menunggu_konfirmasi")
    .orderBy("created_at", "desc");
};

export const updatePemesananWisata = async (kodePesanan, data) => {
  const payload = {
    updated_at: db.fn.now(),
  };

  if (data.nama_pengunjung !== undefined) payload.nama_pengunjung = data.nama_pengunjung;
  if (data.nomor_hp !== undefined) payload.nomor_hp = data.nomor_hp;
  if (data.tanggal_kunjungan !== undefined) payload.tanggal_kunjungan = data.tanggal_kunjungan;
  if (data.jumlah_orang !== undefined) payload.jumlah_orang = data.jumlah_orang;
  if (data.catatan !== undefined) payload.catatan = data.catatan;

  if (data.nominal_satuan !== undefined) payload.nominal_satuan = data.nominal_satuan;
  if (data.total_nominal !== undefined) payload.total_nominal = data.total_nominal;
  if (data.price_label !== undefined) payload.price_label = data.price_label;

  if (data.status_pesanan !== undefined) payload.status_pesanan = data.status_pesanan;
  if (data.status_pembayaran !== undefined) payload.status_pembayaran = data.status_pembayaran;

  if (data.metode_pembayaran !== undefined) payload.metode_pembayaran = data.metode_pembayaran;
  if (data.jenis_pembayaran !== undefined) payload.jenis_pembayaran = data.jenis_pembayaran;
  if (data.snap_token !== undefined) payload.snap_token = data.snap_token;
  if (data.redirect_url !== undefined) payload.redirect_url = data.redirect_url;

  await db("pemesanan_wisata")
    .where("kode_pesanan", kodePesanan)
    .update(payload);

  return await getPemesananWisataByKodePesanan(kodePesanan);
};

export const konfirmasiPemesananGratis = async (kodePesanan) => {
  await db("pemesanan_wisata")
    .where("kode_pesanan", kodePesanan)
    .update({
      total_nominal: 0,
      status_pesanan: "dikonfirmasi",
      status_pembayaran: "tidak_perlu",
      updated_at: db.fn.now(),
    });

  return await getPemesananWisataByKodePesanan(kodePesanan);
};

export const setHargaPemesananWisata = async (kodePesanan, data) => {
  await db("pemesanan_wisata")
    .where("kode_pesanan", kodePesanan)
    .update({
      nominal_satuan: data.nominal_satuan || 0,
      total_nominal: data.total_nominal || 0,
      price_label: data.price_label || "Harga disesuaikan",
      metode_pembayaran: data.metode_pembayaran || null,
      snap_token: data.snap_token || null,
      redirect_url: data.redirect_url || null,
      status_pesanan: "menunggu_pembayaran",
      status_pembayaran: "menunggu",
      updated_at: db.fn.now(),
    });

  return await getPemesananWisataByKodePesanan(kodePesanan);
};

export const updateStatusPembayaranWisata = async (kodePesanan, data) => {
  const payload = {
    updated_at: db.fn.now(),
  };

  if (data.status_pembayaran !== undefined) {
    payload.status_pembayaran = data.status_pembayaran;
  }

  if (data.status_pesanan !== undefined) {
    payload.status_pesanan = data.status_pesanan;
  }

  if (data.jenis_pembayaran !== undefined) {
    payload.jenis_pembayaran = data.jenis_pembayaran;
  }

  if (data.status_pembayaran === "dibayar") {
    payload.status_pesanan = "dikonfirmasi";
  }

  if (
    data.status_pembayaran === "dibatalkan" ||
    data.status_pembayaran === "kedaluwarsa"
  ) {
    payload.status_pesanan = "dibatalkan";
  }

  await db("pemesanan_wisata")
    .where("kode_pesanan", kodePesanan)
    .update(payload);

  return await getPemesananWisataByKodePesanan(kodePesanan);
};

export const batalkanPemesananWisata = async (kodePesanan) => {
  await db("pemesanan_wisata")
    .where("kode_pesanan", kodePesanan)
    .update({
      status_pesanan: "dibatalkan",
      status_pembayaran: "dibatalkan",
      updated_at: db.fn.now(),
    });

  return await getPemesananWisataByKodePesanan(kodePesanan);
};

export const selesaikanPemesananWisata = async (kodePesanan) => {
  await db("pemesanan_wisata")
    .where("kode_pesanan", kodePesanan)
    .update({
      status_pesanan: "selesai",
      updated_at: db.fn.now(),
    });

  return await getPemesananWisataByKodePesanan(kodePesanan);
};