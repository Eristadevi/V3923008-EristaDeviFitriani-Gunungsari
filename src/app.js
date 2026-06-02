import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import mapsRoutes from "./routes/maps.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend Gunungsari berjalan",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/maps", mapsRoutes);

export default app;