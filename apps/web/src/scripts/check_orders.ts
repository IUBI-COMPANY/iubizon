import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const envLocalPath = path.resolve(process.cwd(), ".env.local");
let dbUrl = "";
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    if (line.startsWith("DATABASE_URL=") || line.startsWith("DIRECT_URL=")) {
      dbUrl = line.split("=").slice(1).join("=").replace(/['"]/g, "").trim();
      if (dbUrl) break;
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
  });
  console.log("TODAS LAS EMPRESAS:\n", JSON.stringify(companies, null, 2));
}

main().finally(() => pool.end());
