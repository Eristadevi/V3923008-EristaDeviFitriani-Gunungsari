import {
  getAllPaketWisata,
  getPaketWisataAktif,
  getPaketWisataById,
  createPaketWisata,
  updatePaketWisata,
  deletePaketWisata,
} from "../models/paketWisata.model.js";

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

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  return value === true || value === 1 || value === "1" || value === "true";
};

const formatPaketWisata = (item) => {
  return {
    id: item.id,
    kodePaket: item.kode_paket,

    icon: item.ikon,
    imageUrl: item.gambar_url,
    image: item.gambar_url,

    title: item.nama_paket,
    category: item.kategori,

    priceType: item.price_type,
    priceLabel: item.price_label,
    price: item.price_label,
    priceAmount: Number(item.nominal || 0),
    nominal: Number(item.nominal || 0),
    paymentRequired: toBoolean(item.payment_required),

    duration: item.durasi,
    desc: item.deskripsi_singkat,
    detail: item.deskripsi_detail,
    suitable: item.cocok_untuk,
    facilities: parseFasilitas(item.fasilitas),

    active: toBoolean(item.aktif),
    aktif: toBoolean(item.aktif),

    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

const getUploadedImageUrl = (req) => {
  if (!req.file) return null;
  return `/uploads/paket-wisata/${req.file.filename}`;
};

// UNTUK USER / EXPO: hanya tampilkan paket aktif
export const getPaketWisata = async (req, res) => {
  try {
    const paket = await getPaketWisataAktif();

    return res.json({
      success: true,
      message: "Data paket wisata aktif berhasil diambil.",
      data: paket.map(formatPaketWisata),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data paket wisata.",
      error: error.message,
    });
  }
};

// UNTUK ADMIN: kalau route admin kamu butuh semua data
export const getAllPaketWisataAdmin = async (req, res) => {
  try {
    const paket = await getAllPaketWisata();

    return res.json({
      success: true,
      message: "Data paket wisata berhasil diambil.",
      data: paket.map(formatPaketWisata),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data paket wisata.",
      error: error.message,
    });
  }
};

export const getDetailPaketWisata = async (req, res) => {
  try {
    const { id } = req.params;

    const paket = await getPaketWisataById(id);

    if (!paket || !toBoolean(paket.aktif)) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Detail paket wisata berhasil diambil.",
      data: formatPaketWisata(paket),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail paket wisata.",
      error: error.message,
    });
  }
};

export const getDetailPaketWisataAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const paket = await getPaketWisataById(id);

    if (!paket) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Detail paket wisata berhasil diambil.",
      data: formatPaketWisata(paket),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail paket wisata.",
      error: error.message,
    });
  }
};

export const tambahPaketWisata = async (req, res) => {
  try {
    const body = req.body;
    const uploadedImageUrl = getUploadedImageUrl(req);

    const kodePaket =
      body.kodePaket || body.kode_paket || `PKT-${Date.now()}`;

    const title = body.title || body.namaPaket || body.nama_paket;
    const category = body.category || body.kategori;
    const icon = body.icon || body.ikon || "map-pin";
    const imageUrl =
      uploadedImageUrl ||
      body.imageUrl ||
      body.gambarUrl ||
      body.gambar_url ||
      null;

    const priceType = body.priceType || body.price_type || "consult";
    const priceLabel = body.priceLabel || body.price_label || "Menyesuaikan";

    const priceAmount = Number(body.priceAmount || body.nominal || 0);
    const nominal = priceType === "paid" ? priceAmount : 0;

    const duration = body.duration || body.durasi;
    const desc = body.desc || body.deskripsiSingkat || body.deskripsi_singkat;
    const detail = body.detail || body.deskripsiDetail || body.deskripsi_detail;
    const suitable = body.suitable || body.cocokUntuk || body.cocok_untuk;
    const facilities = body.facilities || body.fasilitas || [];

    if (!kodePaket || !title || !category || !priceType || !priceLabel) {
      return res.status(400).json({
        success: false,
        message:
          "kodePaket, title, category, priceType, dan priceLabel wajib diisi.",
      });
    }

    if (!["paid", "free", "consult"].includes(priceType)) {
      return res.status(400).json({
        success: false,
        message: "priceType harus paid, free, atau consult.",
      });
    }

    if (priceType === "paid" && nominal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Paket berbayar wajib memiliki priceAmount lebih dari 0.",
      });
    }

    const paket = await createPaketWisata({
      kode_paket: kodePaket,
      nama_paket: title,
      kategori: category,
      ikon: icon,
      gambar_url: imageUrl,

      price_type: priceType,
      price_label: priceLabel,
      nominal,

      durasi: duration,
      deskripsi_singkat: desc,
      deskripsi_detail: detail,
      cocok_untuk: suitable,
      fasilitas: facilities,
      aktif: true,
    });

    return res.status(201).json({
      success: true,
      message: "Paket wisata berhasil ditambahkan.",
      data: formatPaketWisata(paket),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan paket wisata.",
      error: error.message,
    });
  }
};

export const editPaketWisata = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const paket = await getPaketWisataById(id);

    if (!paket) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    const uploadedImageUrl = getUploadedImageUrl(req);
    const dataUpdate = {};

    if (body.kodePaket !== undefined || body.kode_paket !== undefined) {
      dataUpdate.kode_paket = body.kodePaket || body.kode_paket;
    }

    if (
      body.title !== undefined ||
      body.namaPaket !== undefined ||
      body.nama_paket !== undefined
    ) {
      dataUpdate.nama_paket = body.title || body.namaPaket || body.nama_paket;
    }

    if (body.category !== undefined || body.kategori !== undefined) {
      dataUpdate.kategori = body.category || body.kategori;
    }

    if (body.icon !== undefined || body.ikon !== undefined) {
      dataUpdate.ikon = body.icon || body.ikon;
    }

    if (uploadedImageUrl) {
      dataUpdate.gambar_url = uploadedImageUrl;
    } else if (
      body.imageUrl !== undefined ||
      body.gambarUrl !== undefined ||
      body.gambar_url !== undefined
    ) {
      dataUpdate.gambar_url = body.imageUrl || body.gambarUrl || body.gambar_url;
    }

    if (body.priceType !== undefined || body.price_type !== undefined) {
      const priceType = body.priceType || body.price_type;
      dataUpdate.price_type = priceType;
      dataUpdate.payment_required = priceType === "paid";
    }

    if (body.priceLabel !== undefined || body.price_label !== undefined) {
      dataUpdate.price_label = body.priceLabel || body.price_label;
    }

    if (body.priceAmount !== undefined || body.nominal !== undefined) {
      dataUpdate.nominal = Number(body.priceAmount || body.nominal || 0);
    }

    if (body.duration !== undefined || body.durasi !== undefined) {
      dataUpdate.durasi = body.duration || body.durasi;
    }

    if (
      body.desc !== undefined ||
      body.deskripsiSingkat !== undefined ||
      body.deskripsi_singkat !== undefined
    ) {
      dataUpdate.deskripsi_singkat =
        body.desc || body.deskripsiSingkat || body.deskripsi_singkat;
    }

    if (
      body.detail !== undefined ||
      body.deskripsiDetail !== undefined ||
      body.deskripsi_detail !== undefined
    ) {
      dataUpdate.deskripsi_detail =
        body.detail || body.deskripsiDetail || body.deskripsi_detail;
    }

    if (
      body.suitable !== undefined ||
      body.cocokUntuk !== undefined ||
      body.cocok_untuk !== undefined
    ) {
      dataUpdate.cocok_untuk =
        body.suitable || body.cocokUntuk || body.cocok_untuk;
    }

    if (body.facilities !== undefined || body.fasilitas !== undefined) {
      dataUpdate.fasilitas = body.facilities || body.fasilitas;
    }

    if (body.active !== undefined) {
      dataUpdate.aktif = toBoolean(body.active);
    }

    if (body.aktif !== undefined) {
      dataUpdate.aktif = toBoolean(body.aktif);
    }

    const paketBaru = await updatePaketWisata(id, dataUpdate);

    return res.json({
      success: true,
      message: "Paket wisata berhasil diperbarui.",
      data: formatPaketWisata(paketBaru),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui paket wisata.",
      error: error.message,
    });
  }
};

// Ini HAPUS PERMANEN jika model deletePaketWisata pakai .del()
export const hapusPaketWisata = async (req, res) => {
  try {
    const { id } = req.params;

    const paket = await getPaketWisataById(id);

    if (!paket) {
      return res.status(404).json({
        success: false,
        message: "Paket wisata tidak ditemukan.",
      });
    }

    await deletePaketWisata(id);

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