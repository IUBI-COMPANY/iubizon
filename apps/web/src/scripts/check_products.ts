import fs from "fs";
import path from "path";

// Cargar .env.local antes de importar @iubizon/db
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed
      .slice(eqIdx + 1)
      .replace(/['"]/g, "")
      .trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const { db } = await import("@iubizon/db");

async function main() {
  const products = await db.product.findMany({
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

  const epson = products.find((p) =>
    p.title.toLowerCase().includes("proyector epson"),
  );
  if (epson) {
    console.log("\nPRODUCTO EPSON ENCONTRADO:", epson);
    const updated = await db.product.update({
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
  .finally(() => db.$disconnect());
