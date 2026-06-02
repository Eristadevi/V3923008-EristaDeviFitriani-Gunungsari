import {
  getAllMapDestinations,
  getMapDestinationById,
  createMapDestination,
  updateMapDestination,
  deleteMapDestination,
} from "../models/maps.model.js";

const allowedTypes = ["wisata", "kuliner", "penginapan"];

const formatDestination = (item) => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    latitude: Number(item.latitude),
    longitude: Number(item.longitude),
    imageKey: item.image_key,
    isActive: Boolean(item.is_active),
  };
};

export const getMapDestinations = async (req, res) => {
  try {
    const destinations = await getAllMapDestinations();

    return res.json({
      success: true,
      message: "Data destinasi maps berhasil diambil.",
      data: destinations.map(formatDestination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data destinasi maps.",
      error: error.message,
    });
  }
};

export const getMapDestinationDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await getMapDestinationById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      message: "Detail destinasi maps berhasil diambil.",
      data: formatDestination(destination),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail destinasi maps.",
      error: error.message,
    });
  }
};

export const addMapDestination = async (req, res) => {
  try {
    const { title, description, type, latitude, longitude, imageKey } = req.body;

    if (!title || !type || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "title, type, latitude, dan longitude wajib diisi.",
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type harus wisata, kuliner, atau penginapan.",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude dan longitude harus berupa angka.",
      });
    }

    const destination = await createMapDestination({
      title,
      description,
      type,
      latitude: lat,
      longitude: lng,
      image_key: imageKey,
      is_active: true,
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

export const editMapDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, latitude, longitude, imageKey, isActive } =
      req.body;

    const existingDestination = await getMapDestinationById(id);

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi tidak ditemukan.",
      });
    }

    if (!title || !type || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "title, type, latitude, dan longitude wajib diisi.",
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type harus wisata, kuliner, atau penginapan.",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude dan longitude harus berupa angka.",
      });
    }

    const updatedDestination = await updateMapDestination(id, {
      title,
      description,
      type,
      latitude: lat,
      longitude: lng,
      image_key: imageKey,
      is_active: isActive ?? true,
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

export const removeMapDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const existingDestination = await getMapDestinationById(id);

    if (!existingDestination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi tidak ditemukan.",
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

export const createRouteUrl = async (req, res) => {
  try {
    const { originLatitude, originLongitude, destinationId, travelMode } =
      req.body;

    if (
      originLatitude === undefined ||
      originLongitude === undefined ||
      !destinationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "originLatitude, originLongitude, dan destinationId wajib dikirim.",
      });
    }

    const originLat = Number(originLatitude);
    const originLng = Number(originLongitude);

    if (Number.isNaN(originLat) || Number.isNaN(originLng)) {
      return res.status(400).json({
        success: false,
        message: "originLatitude dan originLongitude harus berupa angka.",
      });
    }

    const destination = await getMapDestinationById(destinationId);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi tidak ditemukan.",
      });
    }

    const mode = travelMode || "driving";

    const origin = `${originLat},${originLng}`;
    const target = `${destination.latitude},${destination.longitude}`;

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${target}&travelmode=${mode}`;

    const googleNavigationUrl = `google.navigation:q=${destination.latitude},${destination.longitude}&mode=d`;

    return res.json({
      success: true,
      message: "URL rute berhasil dibuat.",
      data: {
        destination: formatDestination(destination),
        route: {
          originLatitude: originLat,
          originLongitude: originLng,
          destinationLatitude: Number(destination.latitude),
          destinationLongitude: Number(destination.longitude),
          travelMode: mode,
          googleMapsUrl,
          googleNavigationUrl,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat URL rute.",
      error: error.message,
    });
  }
};

/**
 * Untuk menampilkan rute di dalam aplikasi.
 * Backend mengambil rute dari OSRM, lalu mengirim coordinates ke frontend.
 * Frontend nanti menggambar coordinates ini memakai <Polyline />.
 */
export const createRouteDetail = async (req, res) => {
  try {
    const { originLatitude, originLongitude, destinationId } = req.body;

    if (
      originLatitude === undefined ||
      originLongitude === undefined ||
      !destinationId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "originLatitude, originLongitude, dan destinationId wajib dikirim.",
      });
    }

    const originLat = Number(originLatitude);
    const originLng = Number(originLongitude);

    if (Number.isNaN(originLat) || Number.isNaN(originLng)) {
      return res.status(400).json({
        success: false,
        message: "originLatitude dan originLongitude harus berupa angka.",
      });
    }

    const destination = await getMapDestinationById(destinationId);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destinasi tidak ditemukan.",
      });
    }

    const destinationLat = Number(destination.latitude);
    const destinationLng = Number(destination.longitude);

    if (Number.isNaN(destinationLat) || Number.isNaN(destinationLng)) {
      return res.status(400).json({
        success: false,
        message: "Koordinat destinasi tidak valid.",
      });
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}?overview=full&geometries=geojson`;

    const osrmResponse = await fetch(osrmUrl);
    const osrmResult = await osrmResponse.json();

    if (
      !osrmResult.routes ||
      !Array.isArray(osrmResult.routes) ||
      osrmResult.routes.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Rute tidak ditemukan.",
      });
    }

    const route = osrmResult.routes[0];

    const coordinates = route.geometry.coordinates.map((coordinate) => ({
      latitude: coordinate[1],
      longitude: coordinate[0],
    }));

    const distanceKm = Number((route.distance / 1000).toFixed(2));
    const durationMinutes = Math.ceil(route.duration / 60);

    return res.json({
      success: true,
      message: "Detail rute berhasil dibuat.",
      data: {
        destination: formatDestination(destination),
        route: {
          originLatitude: originLat,
          originLongitude: originLng,
          destinationLatitude: destinationLat,
          destinationLongitude: destinationLng,
          distanceKm,
          durationMinutes,
          coordinates,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat detail rute.",
      error: error.message,
    });
  }
};