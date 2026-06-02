import { db } from "../core/config/knex.js";

export const getAllMapDestinations = async () => {
  return await db("map_destinations")
    .select(
      "id",
      "title",
      "description",
      "type",
      "latitude",
      "longitude",
      "image_key",
      "is_active"
    )
    .where("is_active", true)
    .orderBy("id", "asc");
};

export const getMapDestinationById = async (id) => {
  return await db("map_destinations")
    .select(
      "id",
      "title",
      "description",
      "type",
      "latitude",
      "longitude",
      "image_key",
      "is_active"
    )
    .where("id", id)
    .where("is_active", true)
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

  return await getMapDestinationById(id);
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

  return await getMapDestinationById(id);
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