import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createAdmin } from "../models/user.model.js";

const createAdmins = async () => {
  try {
    const passwordAdmin1 = await bcrypt.hash("admin123", 10);
    const passwordAdmin2 = await bcrypt.hash("admin456", 10);

    const admins = [
      {
        id: uuidv4(),
        username: "admin1",
        nama_lengkap: "Admin Gunungsari 1",
        nomor_telepon: "080000000001",
        email: "admin1@gunungsari.com",
        password: passwordAdmin1,
        role: "admin",
      },
      {
        id: uuidv4(),
        username: "admin2",
        nama_lengkap: "Admin Gunungsari 2",
        nomor_telepon: "080000000002",
        email: "admin2@gunungsari.com",
        password: passwordAdmin2,
        role: "admin",
      },
    ];

    for (const admin of admins) {
      await createAdmin(admin);
    }

    console.log("2 akun admin berhasil dibuat.");
    process.exit();
  } catch (error) {
    console.log("Gagal membuat admin:", error.message);
    process.exit();
  }
};

createAdmins();