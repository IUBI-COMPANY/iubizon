import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const connectionStringMatch = envContent.match(/DIRECT_URL="([^"]+)"/) || envContent.match(/DATABASE_URL="([^"]+)"/);

const connectionString = connectionStringMatch![1].replace('pgbouncer=true', '').replace('?&', '?');
const pool = new Pool({ connectionString });

async function testQuery() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT cm.role, c.* 
      FROM public.company_members cm
      JOIN public.companies c ON cm.company_id = c.id
      WHERE cm.user_id = '10432af3-9d11-4bda-9e3e-8d86921e734b'
    `);
    console.log("RESULTADO SQL DIRECTO:");
    console.log(res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

testQuery();
