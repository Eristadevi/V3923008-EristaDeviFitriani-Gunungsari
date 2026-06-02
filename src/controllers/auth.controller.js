import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import {
  createUser,
  findUserById,
  findUserByLogin,
  checkUsernameOrEmailExists,
} from "../models/user.model.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      namaLengkap: user.nama_lengkap,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const register = async (req, res) => {
  try {
    const {
      username,
      namaLengkap,
      nomorTelepon,
      email,
      password,
      konfirmasiPassword,
    } = req.body;

    if (
      !username ||
      !namaLengkap ||
      !nomorTelepon ||
      !email ||
      !password ||
      !konfirmasiPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Semua data registrasi wajib diisi.",
      });
    }

    if (password !== konfirmasiPassword) {
      return res.status(400).json({
        success: false,
        message: "Password dan konfirmasi password tidak sama.",
      });
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
      nomor_telepon: nomorTelepon,
      email,
      password: hashedPassword,
      role: "pengguna",
    };

    await createUser(user);

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          namaLengkap: user.nama_lengkap,
          nomorTelepon: user.nomor_telepon,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan registrasi.",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/email dan password wajib diisi.",
      });
    }

    const user = await findUserByLogin(login);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Akun tidak ditemukan.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password salah.",
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: "Login berhasil.",
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          namaLengkap: user.nama_lengkap,
          nomorTelepon: user.nomor_telepon,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan login.",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Data pengguna tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        namaLengkap: user.nama_lengkap,
        nomorTelepon: user.nomor_telepon,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil profil.",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  return res.json({
    success: true,
    message: "Logout berhasil. Hapus token di aplikasi.",
  });
};