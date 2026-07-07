import { db } from "../core/config/knex.js";

const TABLE = "events";
const PAKET_TABLE = "paket_wisata";

const selectColumns = [
  "events.id",
  "events.paket_id",
  "events.title",
  "events.slug",
  "events.category",
  "events.event_date",
  "events.location",
  "events.image_url",
  "events.description",
  "events.detail",
  "events.is_active",
  "events.urutan",
  "events.created_at",
  "events.updated_at",
  "paket_wisata.nama_paket as paket_title",
];

const normalizeEventPayload = (data) => {
  return {
    paket_id: data.paket_id || data.paketId || null,
    title: data.title,
    slug: data.slug,
    category: data.category || null,
    event_date: data.event_date || data.eventDate || null,
    location: data.location || null,
    image_url: data.image_url || data.imageUrl || null,
    description: data.description,
    detail: data.detail || null,
    is_active: data.is_active ?? data.isActive ?? true,
    urutan: data.urutan || 0,
  };
};

// UNTUK ADMIN: ambil semua event, termasuk yang nonaktif
export const getAllEvents = async () => {
  return await db(TABLE)
    .leftJoin(PAKET_TABLE, `${TABLE}.paket_id`, `${PAKET_TABLE}.id`)
    .select(...selectColumns)
    .orderBy(`${TABLE}.urutan`, "asc")
    .orderBy(`${TABLE}.id`, "asc");
};

// UNTUK USER / MOBILE: hanya event yang aktif
export const getEventsAktif = async () => {
  return await db(TABLE)
    .leftJoin(PAKET_TABLE, `${TABLE}.paket_id`, `${PAKET_TABLE}.id`)
    .select(...selectColumns)
    .where(`${TABLE}.is_active`, true)
    .orderBy(`${TABLE}.urutan`, "asc")
    .orderBy(`${TABLE}.event_date`, "asc");
};

export const getEventById = async (id) => {
  return await db(TABLE)
    .leftJoin(PAKET_TABLE, `${TABLE}.paket_id`, `${PAKET_TABLE}.id`)
    .select(...selectColumns)
    .where(`${TABLE}.id`, id)
    .first();
};

export const getEventBySlug = async (slug) => {
  return await db(TABLE)
    .select(
      "id",
      "paket_id",
      "title",
      "slug",
      "category",
      "event_date",
      "location",
      "image_url",
      "description",
      "detail",
      "is_active",
      "urutan",
      "created_at",
      "updated_at"
    )
    .where("slug", slug)
    .first();
};

export const createEvent = async (data) => {
  const payload = normalizeEventPayload(data);

  const [id] = await db(TABLE).insert(payload);

  return await getEventById(id);
};

export const updateEvent = async (id, data) => {
  const payload = {
    ...normalizeEventPayload(data),
    updated_at: db.fn.now(),
  };

  await db(TABLE).where("id", id).update(payload);

  return await getEventById(id);
};

// HAPUS PERMANEN
export const deleteEvent = async (id) => {
  return await db(TABLE).where("id", id).del();
};

// UNTUK SELECT OPTION DI FORM ADMIN EVENT
export const getPaketOptionsForEvent = async () => {
  return await db(PAKET_TABLE)
    .select(
      "id",
      "kode_paket",
      "nama_paket",
      "kategori",
      "aktif"
    )
    .where("aktif", true)
    .orderBy("id", "asc");
};