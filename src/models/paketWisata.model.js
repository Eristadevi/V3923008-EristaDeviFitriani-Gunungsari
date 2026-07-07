import { db } from "../core/config/knex.js";

const TABLE = "paket_wisata";

const selectColumns = [
  "id",
  "kode_paket",
  "nama_paket",
  "kategori",
  "ikon",
  "gambar_url",
  "price_type",
  "price_label",
  "nominal",
  "payment_required",
  "durasi",
  "deskripsi_singkat",
  "deskripsi_detail",
  "cocok_untuk",
  "fasilitas",
  "aktif",
  "created_at",
  "updated_at",
];

const normalizeFasilitasForDb = (value) => {
  if (!value) return null;

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  try {
    const parsed = JSON.parse(value);
    return JSON.stringify(Array.isArray(parsed) ? parsed : []);
  } catch {
    return JSON.stringify(
      String(value)
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }
};

// UNTUK ADMIN: ambil semua, termasuk yang nonaktif
export const getAllPaketWisata = async () => {
  return await db(TABLE)
    .select(...selectColumns)
    .orderBy("id", "asc");
};

// UNTUK USER / MOBILE: hanya paket yang aktif
export const getPaketWisataAktif = async () => {
  return await db(TABLE)
    .select(...selectColumns)
    .where("aktif", true)
    .orderBy("id", "asc");
};

export const getPaketWisataById = async (id) => {
  return await db(TABLE)
    .select(...selectColumns)
    .where("id", id)
    .first();
};

export const getPaketWisataByKode = async (kodePaket) => {
  return await db(TABLE)
    .select(...selectColumns)
    .where("kode_paket", kodePaket)
    .first();
};

export const createPaketWisata = async (data) => {
  const [id] = await db(TABLE).insert({
    kode_paket: data.kode_paket,
    nama_paket: data.nama_paket,
    kategori: data.kategori,
    ikon: data.ikon || null,
    gambar_url: data.gambar_url || null,

    price_type: data.price_type || "consult",
    price_label: data.price_label || "Menyesuaikan",
    nominal: data.nominal || 0,
    payment_required: data.price_type === "paid",

    durasi: data.durasi,
    deskripsi_singkat: data.deskripsi_singkat,
    deskripsi_detail: data.deskripsi_detail,
    cocok_untuk: data.cocok_untuk || null,
    fasilitas: normalizeFasilitasForDb(data.fasilitas),

    aktif: data.aktif ?? true,
  });

  return await getPaketWisataById(id);
};

export const updatePaketWisata = async (id, data) => {
  const payload = {
    ...data,
    updated_at: db.fn.now(),
  };

  if (data.fasilitas !== undefined) {
    payload.fasilitas = normalizeFasilitasForDb(data.fasilitas);
  }

  await db(TABLE).where("id", id).update(payload);

  return await getPaketWisataById(id);
};

// HAPUS PERMANEN
export const deletePaketWisata = async (id) => {
  return await db(TABLE).where("id", id).del();
};