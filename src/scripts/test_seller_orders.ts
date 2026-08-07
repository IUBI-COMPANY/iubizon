import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("❌ Debes pasar un user_id como argumento.");
    process.exit(1);
  }

  const memberships = await prisma.companyMember.findMany({
    where: { user_id: userId },
    select: { company_id: true },
  });
  const companyIds = memberships.map((m) => m.company_id);

  if (companyIds.length === 0) {
    console.log(
      "No tienes empresas. Verifica que exista una empresa personal.",
    );
    process.exit(0);
  }

  const packages = await prisma.orderPackage.findMany({
    where: { company_id: { in: companyIds } },
    include: {
      company: { select: { name: true } },
      order: { select: { order_code: true } },
      items: {
        include: {
          product: { select: { title: true } },
        },
      },
    },
  });

  console.log(`Empresas del usuario:`, companyIds);
  console.log(`Paquetes encontrados:`, packages.length);
  for (const pkg of packages) {
    console.log(
      `  - Paquete ${pkg.id} | Orden ${pkg.order.order_code} | Empresa: ${pkg.company?.name} | Items: ${pkg.items.length}`,
    );
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
