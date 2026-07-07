import {
  getAllAdminMapDestinations,
  getAdminMapDestinationById,
  createMapDestination,
  updateMapDestination,
  deleteMapDestination,
  restoreMapDestination,
} from "../models/maps.model.js";

const allowedTypes = ["wisata", "kuliner", "penginapan"];

const formatDestination = (item) => {
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    imageKey: item.image_key,
    isActive: Boolean(item.is_active),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

const parseBoolean = (value, defaultValue = true) => {
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

const validateMapPayload = ({ title, type, latitude, longitude }) => {
  if (!title || !type || latitude === undefined || longitude === undefined) {
    return {
      valid: false,
      message: "title, type, latitude, dan longitude wajib diisi.",
    };
  }

  if (!allowedTypes.includes(type)) {
    return {
      valid: false,
      message: "Type harus wisata, kuliner, atau penginapan.",
    };
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return {
      valid: false,
      message: "Latitude dan longitude harus berupa angka.",
    };
  }

  if (lat < -90 || lat > 90) {
    return {
      valid: false,
      message: "Latitude harus berada di antara -90 sampai 90.",
    };
  }

  if (lng < -180 || lng > 180) {
    return {
      valid: false,
      message: "Longitude harus berada di antara -180 sampai 180.",
    };
  }

  return {
    valid: true,
    latitude: lat,
    longitude: lng,
  };
};

export const getAdminMapDestinations = async (req, res) => {
  try {
    const destinations = await getAllAdminMapDestinations();

    return res.json({
      success: true,
      message: "Data maps admin berhasil diambil.",
      data: destinations.map(formatDestination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data maps admin.",
      error: error.message,
    });
  }
};

export const getAdminMapDestinationDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await getAdminMapDestinationById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi maps tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Detail maps admin berhasil diambil.",
      data: formatDestination(destination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail maps admin.",
      error: error.message,
    });
  }
};

export const addAdminMapDestination = async (req, res) => {
  try {
    const { title, description, type, latitude, longitude, imageKey, isActive } =
      req.body;

    const validation = validateMapPayload({
      title,
      type,
      latitude,
      longitude,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const uploadedImageKey = req.file ? `maps/${req.file.filename}` : null;

    const destination = await createMapDestination({
      title,
      description: description || null,
      type,
      latitude: validation.latitude,
      longitude: validation.longitude,
      image_key: uploadedImageKey || imageKey || null,
      is_active: parseBoolean(isActive, true),
    });

    return res.status(201).json({
      success: true,
      message: "Destinasi maps berhasil ditambahkan.",
      data: formatDestination(destination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan destinasi maps.",
      error: error.message,
    });
  }
};

export const editAdminMapDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, latitude, longitude, imageKey, isActive } =
      req.body;

    const existingDestination = await getAdminMapDestinationById(id);

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi maps tidak ditemukan.",
      });
    }

    const validation = validateMapPayload({
      title,
      type,
      latitude,
      longitude,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    const uploadedImageKey = req.file ? `maps/${req.file.filename}` : null;

    const finalImageKey =
      uploadedImageKey || imageKey || existingDestination.image_key || null;

    const updatedDestination = await updateMapDestination(id, {
      title,
      description: description || null,
      type,
      latitude: validation.latitude,
      longitude: validation.longitude,
      image_key: finalImageKey,
      is_active: parseBoolean(isActive, existingDestination.is_active),
    });

    return res.json({
      success: true,
      message: "Destinasi maps berhasil diperbarui.",
      data: formatDestination(updatedDestination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui destinasi maps.",
      error: error.message,
    });
  }
};

export const deleteAdminMapDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDestination = await getAdminMapDestinationById(id);

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi maps tidak ditemukan.",
      });
    }

    await deleteMapDestination(id);

    return res.json({
      success: true,
      message: "Destinasi maps berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus destinasi maps.",
      error: error.message,
    });
  }
};

export const restoreAdminMapDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDestination = await getAdminMapDestinationById(id);

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi maps tidak ditemukan.",
      });
    }

    const restoredDestination = await restoreMapDestination(id);

    return res.json({
      success: true,
      message: "Destinasi maps berhasil diaktifkan kembali.",
      data: formatDestination(restoredDestination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengaktifkan destinasi maps.",
      error: error.message,
    });
  }
};