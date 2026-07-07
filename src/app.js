import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import mapsRoutes from "./routes/maps.routes.js";
import koinRoutes from "./routes/koin.routes.js";
import paketWisataRoutes from "./routes/paketWisata.routes.js";
import pemesananWisataRoutes from "./routes/pemesananWisata.routes.js";
import bookingWisataRoutes from "./routes/bookingWisata.routes.js";
import adminTransaksiKoinRoutes from "./routes/adminTransaksiKoin.routes.js";
import adminPemesananWisataRoutes from "./routes/adminPemesananWisata.routes.js";
import adminPaketWisataRoutes from "./routes/adminPaketWisata.routes.js";
import adminBookingWisataRoutes from "./routes/adminBookingWisata.routes.js";
import adminMapsRoutes from "./routes/adminMaps.routes.js";
import eventRoutes from "./routes/event.routes.js";
import adminEventRoutes from "./routes/adminEvent.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({
    message: "Backend Gunungsari berjalan",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/koin", koinRoutes);
app.use("/api/paket-wisata", paketWisataRoutes);
app.use("/api/pemesanan-wisata", pemesananWisataRoutes);
app.use("/api/booking-wisata", bookingWisataRoutes);
app.use("/api/events", eventRoutes);

app.use("/api/admin/transaksi-koin", adminTransaksiKoinRoutes);
app.use("/api/admin/pemesanan-wisata", adminPemesananWisataRoutes);
app.use("/api/admin/paket-wisata", adminPaketWisataRoutes);
app.use("/api/admin/booking-wisata", adminBookingWisataRoutes);
app.use("/api/admin/maps", adminMapsRoutes);
app.use("/api/admin/events", adminEventRoutes);

export default app;