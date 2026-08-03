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

  console.log(`🔍 Iniciando sincronización de datos base para ambiente: [${appEnv || 'default'}]`);
  console.log("🌱 Sincronizando las 11 categorías oficiales y configuraciones globales en la base de datos...");

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

  // 3. Configuraciones Dinámicas de la Plataforma (Administrables desde BD por Admin/SuperAdmin)
  const defaultSettings = [
    {
      key: "COMMISSION_CONFIG",
      value: { base_rate: 0.09, fixed_fee: 2.50, threshold_amount: 40.00 },
      description: "Regla de comisión de la plataforma (9% plano >= S/ 40, o 9% + S/ 2.50 < S/ 40)",
      category: "commission",
    },
    {
      key: "NIUBIZ_CONFIG",
      value: { enabled: true, environment: "sandbox", max_installments: 12 },
      description: "Configuración global de la pasarela de pago Niubiz",
      category: "payment_gateway",
    },
    {
      key: "BUYER_PROTECTION_DAYS",
      value: { days: 7 },
      description: "Días de garantía y retención de pago al vendedor para protección al comprador",
      category: "features",
    },
  ];

  for (const set of defaultSettings) {
    await prisma.platformSetting.upsert({
      where: { key: set.key },
      update: { value: set.value, description: set.description, category: set.category },
      create: set,
    });
  }

  console.log("✅ Configuraciones globales (platform_settings) verificadas/creadas correctamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error durante la ejecución del seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
