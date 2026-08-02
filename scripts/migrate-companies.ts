import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const connectionStringMatch = envContent.match(/DIRECT_URL="([^"]+)"/) || envContent.match(/DATABASE_URL="([^"]+)"/);

if (!connectionStringMatch) {
  console.error("No se encontró DIRECT_URL ni DATABASE_URL en .env.local");
  process.exit(1);
}

const connectionString = connectionStringMatch[1].replace('pgbouncer=true', '').replace('?&', '?');
console.log("Conectando a Supabase PostgreSQL...");

const pool = new Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Añadiendo columna last_active_company_id a public.profiles...");
    await client.query(`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_company_id UUID;`);
    console.log("✓ Columna last_active_company_id añadida a profiles");
  } catch (err) {
    console.error("❌ Error ejecutando la migración:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
