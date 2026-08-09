import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAILS = ["nmoriano26@gmail.com", "ingasergio99@gmail.com"];

async function main() {
  for (const email of ADMIN_EMAILS) {
    const profile = await prisma.profile.findFirst({ where: { email } });
    if (profile && profile.role !== "admin") {
      await prisma.profile.update({ where: { id: profile.id }, data: { role: "admin" } });
      console.log(`✅ ${email} → admin`);
    } else if (profile) {
      console.log(`⏭️ ${email} ya es admin`);
    } else {
      console.log(`⚠️ ${email} no tiene perfil aún (se asignará al registrarse)`);
    }
  }
  await prisma.$disconnect();
}

main();
