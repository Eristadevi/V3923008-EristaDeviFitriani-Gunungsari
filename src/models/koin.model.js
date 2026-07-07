import { db } from "../core/config/knex.js";

const transaksiKoinColumns = [
  "id",
  "user_id",
  "kode_pesanan",
  "nominal",
  "status",
  "jenis_pembayaran",
  "snap_token",
  "redirect_url",
  "kode_penukaran",
  "sudah_ditukar",
  "waktu_ditukar",
  "created_at",
  "updated_at",
];

export const createTransaksiKoin = async (data) => {
  const [id] = await db("transaksi_koin").insert({
    user_id: data.user_id || null,
    kode_pesanan: data.kode_pesanan,
    nominal: data.nominal,
    status: data.status || "menunggu",
    jenis_pembayaran: data.jenis_pembayaran || null,
    snap_token: data.snap_token || null,
    redirect_url: data.redirect_url || null,
    kode_penukaran: data.kode_penukaran || null,
    sudah_ditukar: data.sudah_ditukar ?? false,
    waktu_ditukar: data.waktu_ditukar || null,
  });

  return await getTransaksiKoinById(id);
};

export const getAllTransaksiKoin = async () => {
  return await db("transaksi_koin")
    .select(transaksiKoinColumns)
    .orderBy("created_at", "desc");
};

export const getTransaksiKoinById = async (id) => {
  return await db("transaksi_koin")
    .select(transaksiKoinColumns)
    .where("id", id)
    .first();
};

export const getTransaksiKoinByKodePesanan = async (kodePesanan) => {
  return await db("transaksi_koin")
    .select(transaksiKoinColumns)
    .where("kode_pesanan", kodePesanan)
    .first();
};

export const getTransaksiKoinByKodePenukaran = async (kodePenukaran) => {
  return await db("transaksi_koin")
    .select(transaksiKoinColumns)
    .where("kode_penukaran", kodePenukaran)
    .first();
};

export const getRiwayatTransaksiKoinByUser = async (userId) => {
  return await db("transaksi_koin")
    .select(transaksiKoinColumns)
    .where("user_id", userId)
    .orderBy("created_at", "desc");
};

export const updateTransaksiKoin = async (kodePesanan, data) => {
  const payload = {
    updated_at: db.fn.now(),
  };

  if (data.status !== undefined) payload.status = data.status;
  if (data.jenis_pembayaran !== undefined) payload.jenis_pembayaran = data.jenis_pembayaran;
  if (data.snap_token !== undefined) payload.snap_token = data.snap_token;
  if (data.redirect_url !== undefined) payload.redirect_url = data.redirect_url;
  if (data.kode_penukaran !== undefined) payload.kode_penukaran = data.kode_penukaran;
  if (data.sudah_ditukar !== undefined) payload.sudah_ditukar = data.sudah_ditukar;
  if (data.waktu_ditukar !== undefined) payload.waktu_ditukar = data.waktu_ditukar;

  await db("transaksi_koin")
    .where("kode_pesanan", kodePesanan)
    .update(payload);

  return await getTransaksiKoinByKodePesanan(kodePesanan);
};

export const tukarKoinByKodePesanan = async (kodePesanan) => {
  const transaksi = await getTransaksiKoinByKodePesanan(kodePesanan);

  if (!transaksi) {
    return null;
  }

  if (transaksi.status !== "dibayar") {
    return transaksi;
  }

  if (transaksi.sudah_ditukar) {
    return transaksi;
  }

  await db("transaksi_koin")
    .where("kode_pesanan", kodePesanan)
    .where("status", "dibayar")
    .where("sudah_ditukar", false)
    .update({
      status: "ditukar",
      sudah_ditukar: true,
      waktu_ditukar: db.fn.now(),
      updated_at: db.fn.now(),
    });

  return await getTransaksiKoinByKodePesanan(kodePesanan);
};

export const tukarKoinByKodePenukaran = async (kodePenukaran) => {
  const transaksi = await getTransaksiKoinByKodePenukaran(kodePenukaran);

  if (!transaksi) {
    return null;
  }

  if (transaksi.status !== "dibayar") {
    return transaksi;
  }

  if (transaksi.sudah_ditukar) {
    return transaksi;
  }

  await db("transaksi_koin")
    .where("kode_penukaran", kodePenukaran)
    .where("status", "dibayar")
    .where("sudah_ditukar", false)
    .update({
      status: "ditukar",
      sudah_ditukar: true,
      waktu_ditukar: db.fn.now(),
      updated_at: db.fn.now(),
    });

  return await getTransaksiKoinByKodePenukaran(kodePenukaran);
};