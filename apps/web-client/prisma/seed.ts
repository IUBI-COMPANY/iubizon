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
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;

  console.log(`🔍 Iniciando validación de ambiente para Seeding: [${appEnv}]`);

  // PROTECCIÓN CRÍTICA DE PRODUCCIÓN
  if (appEnv === "production") {
    console.error(
      "❌ BARRERA DE SEGURIDAD ACTIVADA: ¡No se puede ejecutar el script de datos falsos (seed) en PRODUCCIÓN!"
    );
    process.exit(1);
  }

  console.log("🌱 Ejecutando carga de datos de desarrollo (Dev Seeding)...");

  // 1. Categorías del Sistema (Coincidentes con Producción)
  const defaultCategories = [
    { name: "Proyectores y Ecrams", slug: "proyectores", icon: "projector", sort_order: 1 },
    { name: "Laptops y Computadoras", slug: "laptops", icon: "laptop", sort_order: 2 },
    { name: "Pantallas Interactivas", slug: "pantallas-interactivas", icon: "monitor", sort_order: 3 },
    { name: "Celulares y Tablets", slug: "moviles", icon: "smartphone", sort_order: 4 },
    { name: "Audio y Conferencia", slug: "audio", icon: "volume-2", sort_order: 5 },
    { name: "Mobiliario Escolar y Oficina", slug: "mobiliario", icon: "armchair", sort_order: 6 },
    { name: "Redes y Conectividad", slug: "redes", icon: "wifi", sort_order: 7 },
    { name: "Electrónica e Impresión", slug: "electronica", icon: "cpu", sort_order: 8 },
    { name: "Accesorios y Periféricos", slug: "accesorios", icon: "headphones", sort_order: 9 },
    { name: "Útiles y Suministros", slug: "utiles-suministros", icon: "pencil", sort_order: 10 },
    { name: "Otros", slug: "otros", icon: "package", sort_order: 99 },
  ];

  // 1. Eliminar categorías antiguas obsoletas no oficiales
  const validSlugs = defaultCategories.map((c) => c.slug);
  await prisma.category.deleteMany({
    where: {
      slug: {
        notIn: validSlugs,
      },
    },
  });

  // 2. Insertar/Actualizar únicamente las 11 categorías oficiales
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sort_order: cat.sort_order },
      create: cat,
    });
  }

  console.log("✅ Categorías obsoletas eliminadas y 11 categorías oficiales sincronizadas correctamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante la ejecución del seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
