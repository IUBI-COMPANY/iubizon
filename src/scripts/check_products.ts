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

console.log("DB URL Found:", dbUrl ? "SI" : "NO");

const pool = new Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      stock: true,
      availability_type: true,
      status: true,
      price: true,
    },
  });
  console.log(
    "PRODUCTOS EN BASE DE DATOS:\n",
    JSON.stringify(products, null, 2),
  );

  // Actualizar stock de 'Proyector epson powerlite 97H' a 10
  const epson = products.find((p) =>
    p.title.toLowerCase().includes("proyector epson"),
  );
  if (epson) {
    console.log("\nPRODUCTO EPSON ENCONTRADO:", epson);
    const updated = await prisma.product.update({
      where: { id: epson.id },
      data: { stock: 10, availability_type: "available", status: "active" },
    });
    console.log(
      "STOCK DE PROYECTOR EPSON ACTUALIZADO A 10 DE FORMA EXITOSA!",
      updated,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => pool.end());
