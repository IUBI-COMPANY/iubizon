import { Pool } from "pg";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const connectionStringMatch =
  envContent.match(/DIRECT_URL="([^"]+)"/) ||
  envContent.match(/DATABASE_URL="([^"]+)"/);

if (!connectionStringMatch) {
  console.error("No se encontró DIRECT_URL ni DATABASE_URL en .env.local");
  process.exit(1);
}

const connectionString = connectionStringMatch[1]
  .replace("pgbouncer=true", "")
  .replace("?&", "?");
const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    const resProfiles = await client.query(
      `SELECT * FROM public.profiles WHERE email ILIKE '%mariano260996%';`,
    );
    console.log("=== PERFIL mariano260996 ===");
    console.log(resProfiles.rows);

    const resCompanies = await client.query(`SELECT * FROM public.companies;`);
    console.log("=== EMPRESAS ===");
    console.log(resCompanies.rows);

    const resMembers = await client.query(
      `SELECT * FROM public.company_members;`,
    );
    console.log("=== COMPANY MEMBERS ===");
    console.log(resMembers.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
