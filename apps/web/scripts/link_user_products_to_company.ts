import { Pool } from "pg";
import fs from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const connectionStringMatch =
  envContent.match(/DIRECT_URL="([^"]+)"/) ||
  envContent.match(/DATABASE_URL="([^"]+)"/);

if (!connectionStringMatch) {
  console.error("No se encontró cadena de conexión");
  process.exit(1);
}

const connectionString = connectionStringMatch[1]
  .replace("pgbouncer=true", "")
  .replace("?&", "?");
const pool = new Pool({ connectionString });

async function linkProducts() {
  const client = await pool.connect();
  try {
    const userRes = await client.query(
      `SELECT id FROM public.profiles WHERE email ILIKE '%mariano260996%';`,
    );
    if (userRes.rows.length === 0) {
      console.error("No se encontró usuario mariano260996");
      return;
    }
    const userId = userRes.rows[0].id;

    const companyRes = await client.query(
      `SELECT id, name FROM public.companies WHERE email ILIKE '%mariano260996%' OR name ILIKE '%ElleonStore%';`,
    );
    if (companyRes.rows.length === 0) {
      console.error("No se encontró empresa ElleonStore");
      return;
    }
    const companyId = companyRes.rows[0].id;
    const companyName = companyRes.rows[0].name;

    console.log(
      `Vincular productos del usuario ${userId} a la empresa "${companyName}" (${companyId})...`,
    );

    const updateRes = await client.query(
      `
      UPDATE public.products
      SET company_id = $1
      WHERE seller_id = $2;
    `,
      [companyId, userId],
    );

    console.log(
      `✓ Se vincularon ${updateRes.rowCount} productos a la empresa "${companyName}"!`,
    );
  } catch (err) {
    console.error("❌ Error al vincular productos:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

linkProducts();
