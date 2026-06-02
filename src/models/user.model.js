import { db } from "../core/config/knex.js";

export const createUser = async (user) => {
  await db("users").insert(user);
  return user;
};

export const findUserById = async (id) => {
  return await db("users")
    .select(
      "id",
      "username",
      "nama_lengkap",
      "nomor_telepon",
      "email",
      "role",
      "created_at",
      "updated_at"
    )
    .where("id", id)
    .first();
};

export const findUserByLogin = async (login) => {
  return await db("users")
    .where("username", login)
    .orWhere("email", login)
    .first();
};

export const checkUsernameOrEmailExists = async (username, email) => {
  return await db("users")
    .where("username", username)
    .orWhere("email", email)
    .first();
};

export const countAdmins = async () => {
  const result = await db("users")
    .where("role", "admin")
    .count("id as total")
    .first();

  return Number(result.total);
};

export const createAdmin = async (admin) => {
  const totalAdmin = await countAdmins();

  if (totalAdmin >= 2) {
    throw new Error("Jumlah admin maksimal 2 orang.");
  }

  await db("users").insert(admin);
  return admin;
};