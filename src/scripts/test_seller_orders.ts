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

async function testQuery(companyId: string | null) {
  let whereClause: any;

  if (companyId) {
    whereClause = {
      OR: [{ company_id: companyId }, { product: { company_id: companyId } }],
    };
  } else {
    whereClause = {
      company_id: null,
    };
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    select: {
      id: true,
      company_id: true,
      product: { select: { title: true, company_id: true } },
    },
  });

  console.log(
    `RESULTADO PARA company_id = ${companyId}:`,
    orders.length,
    "órdenes",
  );
}

async function main() {
  console.log("--- PROBANDO CONSULTA DE ORDENES ---");
  await testQuery("24ed6264-c72f-4321-ac69-50014257f6d8"); // SellBox
  await testQuery("4b7e1a24-c5ea-4716-9ec1-76209a044029"); // TEST COMPANY S.A.C.
  await testQuery("18e01fc4-d6da-4c93-adc6-a2d79d63c4a5"); // iubizon
}

main().finally(() => pool.end());
