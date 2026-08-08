import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";
import * as path from "path";

// Apunta a la raíz del monorepo donde se encuentra .env o .env.local
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const directUrl =
  process.env.DIRECT_URL && process.env.DIRECT_URL.trim() !== ""
    ? process.env.DIRECT_URL
    : undefined;
const dbUrl =
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ""
    ? process.env.DATABASE_URL
    : undefined;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node --import tsx/esm prisma/seed.ts",
  },
  datasource: {
    url: directUrl || dbUrl || "",
  },
});
