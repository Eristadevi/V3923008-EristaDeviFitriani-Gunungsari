import { db } from "../core/config/knex.js";

const mapColumns = [
  "id",
  "title",
  "description",
  "type",
  "latitude",
  "longitude",
  "image_key",
  "is_active",
  "created_at",
  "updated_at",
];

// USER EXPO GO - hanya data aktif
export const getAllMapDestinations = async () => {
  return await db("map_destinations")
    .select(mapColumns)
    .where("is_active", true)
    .orderBy("id", "asc");
};

// ADMIN REACT VITE - semua data, aktif dan nonaktif
export const getAllAdminMapDestinations = async () => {
  return await db("map_destinations")
    .select(mapColumns)
    .orderBy("id", "desc");
};

// USER EXPO GO - detail hanya data aktif
export const getMapDestinationById = async (id) => {
  return await db("map_destinations")
    .select(mapColumns)
    .where("id", id)
    .where("is_active", true)
    .first();
};

// ADMIN REACT VITE - detail semua data
export const getAdminMapDestinationById = async (id) => {
  return await db("map_destinations")
    .select(mapColumns)
    .where("id", id)
    .first();
};

export const createMapDestination = async (data) => {
  const [id] = await db("map_destinations").insert({
    title: data.title,
    description: data.description || null,
    type: data.type,
    latitude: data.latitude,
    longitude: data.longitude,
    image_key: data.image_key || null,
    is_active: data.is_active ?? true,
  });

  return await getAdminMapDestinationById(id);
};

export const updateMapDestination = async (id, data) => {
  await db("map_destinations")
    .where("id", id)
    .update({
      title: data.title,
      description: data.description || null,
      type: data.type,
      latitude: data.latitude,
      longitude: data.longitude,
      image_key: data.image_key || null,
      is_active: data.is_active ?? true,
      updated_at: db.fn.now(),
    });

  return await getAdminMapDestinationById(id);
};

export const deleteMapDestination = async (id) => {
  await db("map_destinations")
    .where("id", id)
    .update({
      is_active: false,
      updated_at: db.fn.now(),
    });

  return true;
};

export const restoreMapDestination = async (id) => {
  await db("map_destinations")
    .where("id", id)
    .update({
      is_active: true,
      updated_at: db.fn.now(),
    });

  return await getAdminMapDestinationById(id);
};