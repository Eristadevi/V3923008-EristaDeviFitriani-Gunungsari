import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  development: {
    client: process.env.DB_CLIENT || "mysql2",
    connection: {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "gunungsari",
    },
    migrations: {
      directory: path.join(__dirname, "src", "migrations"),
      extension: "js",
    },
  },
};