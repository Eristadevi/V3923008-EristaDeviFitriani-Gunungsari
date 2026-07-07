import {
  getAllEvents,
  getEventsAktif,
  getEventById,
  getEventBySlug,
  createEvent as createEventModel,
  updateEvent as updateEventModel,
  deleteEvent as deleteEventModel,
  getPaketOptionsForEvent,
} from "../models/event.model.js";

const makeSlug = (text) => {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "dan")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const toBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (value === true || value === "true" || value === "1" || value === 1) {
    return true;
  }

  if (value === false || value === "false" || value === "0" || value === 0) {
    return false;
  }

  return defaultValue;
};

const toNumber = (value, defaultValue = 0) => {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
};

const formatEvent = (event) => {
  if (!event) return null;

  return {
    id: event.id,
    paketId: event.paket_id,
    paketTitle: event.paket_title || null,

    title: event.title,
    slug: event.slug,
    category: event.category,

    date: event.event_date,
    eventDate: event.event_date,

    location: event.location,

    imageUrl: event.image_url,
    image_url: event.image_url,

    desc: event.description,
    description: event.description,

    detail: event.detail,

    isActive: Boolean(event.is_active),
    is_active: Boolean(event.is_active),

    urutan: event.urutan,

    createdAt: event.created_at,
    updatedAt: event.updated_at,
  };
};

const buildEventPayload = async ({
  body,
  oldEvent = null,
  file = null,
  isUpdate = false,
}) => {
  const paketId = body.paketId || body.paket_id || null;

  const title = body.title;
  const category = body.category || null;
  const eventDate = body.eventDate || body.event_date || body.date || null;
  const location = body.location || null;

  const description = body.description || body.desc;
  const detail = body.detail || null;

  const isActive = toBoolean(
    body.isActive ?? body.is_active ?? body.aktif,
    true
  );

  const urutan = toNumber(body.urutan, 0);

  let imageUrl = body.imageUrl || body.image_url || null;

  if (file) {
    imageUrl = `/uploads/events/${file.filename}`;
  }

  if (isUpdate && !file && oldEvent) {
    imageUrl = imageUrl || oldEvent.image_url || null;
  }

  let slug = oldEvent?.slug || makeSlug(title);

  if (!isUpdate || title !== oldEvent?.title) {
    const slugBase = makeSlug(title);
    slug = slugBase;

    let counter = 1;

    while (true) {
      const existingEvent = await getEventBySlug(slug);

      if (!existingEvent) break;

      if (isUpdate && Number(existingEvent.id) === Number(oldEvent.id)) {
        break;
      }

      slug = `${slugBase}-${counter}`;
      counter++;
    }
  }

  return {
    paket_id: paketId,
    title,
    slug,
    category,
    event_date: eventDate,
    location,
    image_url: imageUrl,
    description,
    detail,
    is_active: isActive,
    urutan,
  };
};

// UNTUK USER / MOBILE
export const getPublicEvents = async (req, res) => {
  try {
    const events = await getEventsAktif();

    return res.status(200).json({
      success: true,
      message: "Data event berhasil diambil.",
      data: events.map(formatEvent),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data event.",
      error: error.message,
    });
  }
};

// UNTUK ADMIN
export const getAdminEvents = async (req, res) => {
  try {
    const events = await getAllEvents();

    return res.status(200).json({
      success: true,
      message: "Data event admin berhasil diambil.",
      data: events.map(formatEvent),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data event admin.",
      error: error.message,
    });
  }
};

// DETAIL EVENT
export const getEventDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Detail event berhasil diambil.",
      data: formatEvent(event),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail event.",
      error: error.message,
    });
  }
};

// TAMBAH EVENT
export const createEvent = async (req, res) => {
  try {
    const { title } = req.body;
    const description = req.body.description || req.body.desc;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Judul event dan deskripsi wajib diisi.",
      });
    }

    const payload = await buildEventPayload({
      body: req.body,
      file: req.file,
      isUpdate: false,
    });

    const event = await createEventModel(payload);

    return res.status(201).json({
      success: true,
      message: "Event berhasil ditambahkan.",
      data: formatEvent(event),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan event.",
      error: error.message,
    });
  }
};

// UPDATE EVENT
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const oldEvent = await getEventById(id);

    if (!oldEvent) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    const { title } = req.body;
    const description = req.body.description || req.body.desc;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Judul event dan deskripsi wajib diisi.",
      });
    }

    const payload = await buildEventPayload({
      body: req.body,
      oldEvent,
      file: req.file,
      isUpdate: true,
    });

    const event = await updateEventModel(id, payload);

    return res.status(200).json({
      success: true,
      message: "Event berhasil diperbarui.",
      data: formatEvent(event),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui event.",
      error: error.message,
    });
  }
};

// HAPUS EVENT
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event tidak ditemukan.",
      });
    }

    await deleteEventModel(id);

    return res.status(200).json({
      success: true,
      message: "Event berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus event.",
      error: error.message,
    });
  }
};

// UNTUK DROPDOWN PAKET DI FORM ADMIN
export const getPaketOptions = async (req, res) => {
  try {
    const paket = await getPaketOptionsForEvent();

    return res.status(200).json({
      success: true,
      message: "Data pilihan paket berhasil diambil.",
      data: paket.map((item) => ({
        id: item.id,
        kodePaket: item.kode_paket,
        namaPaket: item.nama_paket,
        kategori: item.kategori,
        aktif: Boolean(item.aktif),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pilihan paket.",
      error: error.message,
    });
  }
};