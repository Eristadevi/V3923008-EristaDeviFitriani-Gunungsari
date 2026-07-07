import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import {
  createUser,
  findUserById,
  checkUsernameOrEmailExists,
  getAllUsers,
  updateUserById,
  deleteUserById,
  countAdmins,
} from "../models/user.model.js";

export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.json({
      success: true,
      message: "Data user berhasil diambil.",
      data: {
        totalUser: users.length,
        totalAdmin: users.filter((user) => user.role === "admin").length,
        totalPengguna: users.filter((user) => user.role === "pengguna").length,
        users,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data user.",
      error: error.message,
    });
  }
};

export const createUserByAdmin = async (req, res) => {
  try {
    const {
      username,
      namaLengkap,
      nomorTelepon,
      email,
      password,
      role = "pengguna",
    } = req.body;

    if (!username || !namaLengkap || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, nama lengkap, email, dan password wajib diisi.",
      });
    }

    if (!["pengguna", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid.",
      });
    }

    if (role === "admin") {
      const totalAdmin = await countAdmins();

      if (totalAdmin >= 2) {
        return res.status(400).json({
          success: false,
          message: "Jumlah admin maksimal 2 orang.",
        });
      }
    }

    const existingUser = await checkUsernameOrEmailExists(username, email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username atau email sudah digunakan.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: uuidv4(),
      username,
      nama_lengkap: namaLengkap,
      nomor_telepon: nomorTelepon || null,
      email,
      password: hashedPassword,
      role,
    };

    await createUser(user);

    return res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan.",
      data: {
        id: user.id,
        username: user.username,
        namaLengkap: user.nama_lengkap,
        nomorTelepon: user.nomor_telepon,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan user.",
      error: error.message,
    });
  }
};

export const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, namaLengkap, nomorTelepon, email, role, password } = req.body;

    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    if (role && !["pengguna", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid.",
      });
    }

    if (user.id === req.user.id && role && role !== "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin tidak boleh mengubah role akun sendiri.",
      });
    }

    if (role === "admin" && user.role !== "admin") {
      const totalAdmin = await countAdmins();

      if (totalAdmin >= 2) {
        return res.status(400).json({
          success: false,
          message: "Jumlah admin maksimal 2 orang.",
        });
      }
    }

    const updateData = {
      updated_at: new Date(),
    };

    if (username) updateData.username = username;
    if (namaLengkap) updateData.nama_lengkap = namaLengkap;
    if (nomorTelepon !== undefined) updateData.nomor_telepon = nomorTelepon;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await updateUserById(id, updateData);

    return res.json({
      success: true,
      message: "User berhasil diperbarui.",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui user.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await findUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan.",
      });
    }

    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Admin tidak boleh menghapus akun sendiri.",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Akun admin tidak boleh dihapus dari dashboard.",
      });
    }

    await deleteUserById(id);

    return res.json({
      success: true,
      message: "User berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus user.",
      error: error.message,
    });
  }
};