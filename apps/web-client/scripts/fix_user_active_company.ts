import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const connectionStringMatch = envContent.match(/DIRECT_URL="([^"]+)"/) || envContent.match(/DATABASE_URL="([^"]+)"/);

const connectionString = connectionStringMatch![1].replace('pgbouncer=true', '').replace('?&', '?');
const pool = new Pool({ connectionString });

async function fixUserActiveCompany() {
  const client = await pool.connect();
  try {
    console.log("Actualizando last_active_company_id para mariano260996@gmail.com...");
    await client.query(`
      UPDATE public.profiles 
      SET last_active_company_id = '9bdce47f-9de1-4be8-8b5c-ee6ae08c1f64'
      WHERE email ILIKE '%mariano260996%';
    `);
    console.log("✓ last_active_company_id actualizado con éxito a ElleonStore!");
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserActiveCompany();
