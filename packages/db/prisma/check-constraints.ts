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

const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check(table: string, query: string) {
  try {
    const result: any = await prisma.$queryRawUnsafe(query);
    if (result.length > 0) {
      console.log(`❌ ${table}: ${result.length} violación(es)`);
    } else {
      console.log(`✅ ${table}: OK`);
    }
  } catch (e: any) {
    console.log(`⚠️ ${table}: error - ${e.message}`);
  }
}

async function main() {
  console.log("Verificando integridad antes de agregar constraints:\n");

  // 1. Review: mismo usuario no puede reseñar 2 veces el mismo producto
  await check("Review (buyer_id, product_id)",
    `SELECT buyer_id, product_id, COUNT(*) FROM reviews GROUP BY buyer_id, product_id HAVING COUNT(*) > 1`
  );

  // 2. OrderPackage: misma orden no puede tener 2 paquetes de la misma empresa
  await check("OrderPackage (order_id, company_id)",
    `SELECT order_id, company_id, COUNT(*) FROM order_packages GROUP BY order_id, company_id HAVING COUNT(*) > 1`
  );

  // 3. OrderItem: mismo paquete no puede tener duplicado el mismo producto
  await check("OrderItem (package_id, product_id)",
    `SELECT package_id, product_id, COUNT(*) FROM order_items GROUP BY package_id, product_id HAVING COUNT(*) > 1`
  );

  // 4. SellerPayout: no puede haber 2 pagos por el mismo paquete
  await check("SellerPayout (package_id)",
    `SELECT package_id, COUNT(*) FROM seller_payouts GROUP BY package_id HAVING COUNT(*) > 1`
  );

  // 5. Company: RUC duplicado
  await check("Company (tax_id, excluyendo NULL)",
    `SELECT tax_id, COUNT(*) FROM companies WHERE tax_id IS NOT NULL GROUP BY tax_id HAVING COUNT(*) > 1`
  );

  await prisma.$disconnect();
}

main();
