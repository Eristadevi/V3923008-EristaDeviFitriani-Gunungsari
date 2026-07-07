import express from "express";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

import {
  getUsers,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, adminMiddleware, (req, res) => {
  return res.json({
    success: true,
    message: "Berhasil masuk dashboard admin.",
    data: {
      admin: req.user,
    },
  });
});

router.get("/users", authMiddleware, adminMiddleware, getUsers);
router.post("/users", authMiddleware, adminMiddleware, createUserByAdmin);
router.put("/users/:id", authMiddleware, adminMiddleware, updateUserByAdmin);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;