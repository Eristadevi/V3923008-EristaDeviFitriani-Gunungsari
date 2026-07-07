import {
  getAllPaketWisata,
  getPaketWisataById,
  getPaketWisataByKode,
  createPaketWisata,
  updatePaketWisata,
  deletePaketWisata,
} from "../models/paketWisata.model.js";

const makeKodePaket = () => {
  return `PKT-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
};

const toBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return value === true || value === "true" || value === 1 || value === "1";
};

const toNumber = (value) => {
  const number = Number(value || 0);
  return Number.isNaN(number) ? 0 : number;
};

const normalizePriceType = (value) => {
  const priceType = String(value || "free").toLowerCase();

  if (["free", "paid", "consult"].includes(priceType)) {
    return priceType;
  }

  return "free";
};

const normalizeFasilitas = (value) => {
  if (!value) return JSON.stringify([]);

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

const parseFasilitas = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const mapPaket = (item) => {
  return {
    id: item.id,

    kodePaket: item.kode_paket,
    kode_paket: item.kode_paket,

    title: item.nama_paket,
    namaPaket: item.nama_paket,
    nama_paket: item.nama_paket,

    category: item.kategori,
    kategori: item.kategori,

    icon: item.ikon,
    ikon: item.ikon,

    imageUrl: item.gambar_url,
    gambarUrl: item.gambar_url,
    gambar_url: item.gambar_url,

    priceType: item.price_type,
    price_type: item.price_type,

    priceLabel: item.price_label,
    price_label: item.price_label,

    priceAmount: item.nominal,
    nominal: item.nominal,

    duration: item.durasi,
    durasi: item.durasi,

    desc: item.deskripsi_singkat,
    deskripsiSingkat: item.deskripsi_singkat,
    deskripsi_singkat: item.deskripsi_singkat,

    detail: item.deskripsi_detail,
    deskripsiDetail: item.deskripsi_detail,
    deskripsi_detail: item.deskripsi_detail,

    suitable: item.cocok_untuk,
    cocokUntuk: item.cocok_untuk,
    cocok_untuk: item.cocok_untuk,

    facilities: parseFasilitas(item.fasilitas),
    fasilitas: parseFasilitas(item.fasilitas),

    active: Boolean(item.aktif),
    aktif: Boolean(item.aktif),

    created_at: item.created_at,
    updated_at: item.updated_at,
  };
};

const buildPayload = (body, existing = null) => {
  const priceType = normalizePriceType(
    body.priceType || body.price_type || existing?.price_type
  );

  const nominal =
    priceType === "paid"
      ? toNumber(body.nominal || body.priceAmount || existing?.nominal)
      : 0;

  return {
    kode_paket:
      body.kodePaket ||
      body.kode_paket ||
      existing?.kode_paket ||
      makeKodePaket(),

    nama_paket:
      body.namaPaket ||
      body.nama_paket ||
      body.title ||
      existing?.nama_paket ||
      "",

    kategori:
      body.kategori ||
      body.category ||
      existing?.kategori ||
      "",

    ikon:
      body.ikon ||
      body.icon ||
      existing?.ikon ||
      "leaf",

    gambar_url:
      body.gambarUrl ||
      body.gambar_url ||
      body.imageUrl ||
      existing?.gambar_url ||
      null,

    price_type: priceType,

    price_label:
      body.priceLabel ||
      body.price_label ||
      existing?.price_label ||
      (priceType === "free" ? "Gratis" : "Menyesuaikan kebutuhan"),

    nominal,

    payment_required: priceType === "paid",

    durasi:
      body.durasi ||
      body.duration ||
      existing?.durasi ||
      "",

    deskripsi_singkat:
      body.deskripsiSingkat ||
      body.deskripsi_singkat ||
      body.desc ||
      existing?.deskripsi_singkat ||
      "",

    deskripsi_detail:
      body.deskripsiDetail ||
      body.deskripsi_detail ||
      body.detail ||
      existing?.deskripsi_detail ||
      "",

    cocok_untuk:
      body.cocokUntuk ||
      body.cocok_untuk ||
      body.suitable ||
      existing?.cocok_untuk ||
      "",

    fasilitas: normalizeFasilitas(
      body.fasilitas || body.facilities || existing?.fasilitas
    ),

    aktif: toBoolean(body.aktif ?? body.active, existing?.aktif ?? true),
  };
};

const validatePayload = (payload) => {
  if (!payload.kode_paket) return "Kode paket wajib diisi.";
  if (!payload.nama_paket) return "Nama paket wajib diisi.";
  if (!payload.kategori) return "Kategori wajib diisi.";
  if (!payload.price_type) return "Tipe harga wajib diisi.";
  if (!payload.price_label) return "Label harga wajib diisi.";
  if (!payload.durasi) return "Durasi wajib diisi.";
  if (!payload.deskripsi_singkat) return "Deskripsi singkat wajib diisi.";
  if (!payload.deskripsi_detail) return "Deskripsi detail wajib diisi.";

  if (payload.price_type === "paid" && payload.nominal <= 0) {
    return "Nominal paket berbayar harus lebih dari 0.";
  }

  return null;
};

export const getAllPaketWisataAdmin = async (req, res) => {
  try {
    const data = await getAllPaketWisata();

    return res.json({
      success: true,
      message: "Data paket wisata berhasil diambil.",
      data: data.map(mapPaket),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data paket wisata.",
      error: error.message,
    });
  }
};

export const getDetailPaketWisataAdmin = async (req, res) => {
  try {
    const data = await getPaketWisataById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Detail paket wisata berhasil diambil.",
      data: mapPaket(data),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail paket wisata.",
      error: error.message,
    });
  }
};

export const tambahPaketWisataAdmin = async (req, res) => {
  try {
    const payload = buildPayload(req.body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existing = await getPaketWisataByKode(payload.kode_paket);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Kode paket sudah digunakan.",
      });
    }

    const created = await createPaketWisata(payload);

    return res.status(201).json({
      success: true,
      message: "Paket wisata berhasil ditambahkan.",
      data: mapPaket(created),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan paket wisata.",
      error: error.message,
    });
  }
};

export const editPaketWisataAdmin = async (req, res) => {
  try {
    const existing = await getPaketWisataById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    const payload = buildPayload(req.body, existing);
    const validationError = validatePayload(payload);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const updated = await updatePaketWisata(req.params.id, payload);

    return res.json({
      success: true,
      message: "Paket wisata berhasil diperbarui.",
      data: mapPaket(updated),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui paket wisata.",
      error: error.message,
    });
  }
};

export const hapusPaketWisataAdmin = async (req, res) => {
  try {
    const existing = await getPaketWisataById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    await deletePaketWisata(req.params.id);

    return res.json({
      success: true,
      message: "Paket wisata berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus paket wisata.",
      error: error.message,
    });
  }
};