import { db } from "../index";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;

  console.log(
    `🔍 Iniciando sincronización de datos base para ambiente: [${appEnv || "default"}]`,
  );
  console.log(
    "🌱 Sincronizando las 11 categorías oficiales y configuraciones globales en la base de datos...",
  );

  // 1. Categorías del Sistema (Coincidentes con Producción)
  const defaultCategories = [
    {
      name: "Proyectores y Ecrams",
      slug: "proyectores",
      icon: "Projector",
      sort_order: 1,
    },
    {
      name: "Laptops y Computadoras",
      slug: "laptops",
      icon: "Laptop",
      sort_order: 2,
    },
    {
      name: "Pantallas Interactivas",
      slug: "pantallas-interactivas",
      icon: "Monitor",
      sort_order: 3,
    },
    {
      name: "Celulares y Tablets",
      slug: "moviles",
      icon: "Smartphone",
      sort_order: 4,
    },
    {
      name: "Audio y Conferencia",
      slug: "audio",
      icon: "Volume2",
      sort_order: 5,
    },
    {
      name: "Mobiliario Escolar y Oficina",
      slug: "mobiliario",
      icon: "Armchair",
      sort_order: 6,
    },
    {
      name: "Redes y Conectividad",
      slug: "redes",
      icon: "Wifi",
      sort_order: 7,
    },
    {
      name: "Electrónica e Impresión",
      slug: "electronica",
      icon: "Cpu",
      sort_order: 8,
    },
    {
      name: "Accesorios y Periféricos",
      slug: "accesorios",
      icon: "Headphones",
      sort_order: 9,
    },
    {
      name: "Útiles y Suministros",
      slug: "utiles-suministros",
      icon: "Pencil",
      sort_order: 10,
    },
    { name: "Otros", slug: "otros", icon: "MoreHorizontal", sort_order: 11 },
  ];

  // 1. Eliminar categorías antiguas obsoletas no oficiales
  const validSlugs = defaultCategories.map((c) => c.slug);
  await db.category.deleteMany({
    where: {
      slug: {
        notIn: validSlugs,
      },
    },
  });

  // 2. Insertar/Actualizar únicamente las 11 categorías oficiales
  for (const cat of defaultCategories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sort_order: cat.sort_order },
      create: cat,
    });
  }

  console.log(
    "✅ Categorías obsoletas eliminadas y 11 categorías oficiales sincronizadas correctamente.",
  );

  // 3. Configuraciones Dinámicas de la Plataforma (Administrables desde BD por Admin/SuperAdmin)
  const defaultSettings = [
    {
      key: "COMMISSION_CONFIG",
      value: { base_rate: 0.09, fixed_fee: 2.5, threshold_amount: 40.0 },
      description:
        "Regla de comisión de la plataforma (9% plano >= S/ 40, o 9% + S/ 2.50 < S/ 40)",
      category: "commission",
    },
    {
      key: "NIUBIZ_CONFIG",
      value: {
        enabled: true,
        environment: "sandbox",
        max_installments: 12,
        registrationCount: 1,
        serviceLocation: {
          urlAddress: "https://iubizon.com",
          cityName: "Lima",
          countrySubdivisionCode: "LMA",
          countryCode: "PER",
          postalCode: "15023",
        },
      },
      description: "Configuración global de la pasarela de pago Niubiz",
      category: "payment_gateway",
    },
    {
      key: "PAYMENT_PROVIDERS",
      value: {
        enabled: ["niubiz"],
        providers: {},
      },
      description:
        "Proveedores de pago habilitados y sus credenciales (niubiz, culqi, pago_efectivo, paypal, ...)",
      category: "payment_gateway",
    },
    {
      key: "BUYER_PROTECTION_DAYS",
      value: { days: 7 },
      description:
        "Días de garantía y retención de pago al vendedor para protección al comprador",
      category: "features",
    },
    {
      key: "SHIPPING_CONFIG",
      value: {
        is_free: true,
        default_cost: 0.0,
        promotion_label: "Promoción de Lanzamiento (Envío GRATIS)",
      },
      description:
        "Configuración global del costo de envío y promociones de despacho",
      category: "shipping",
    },
    {
      key: "COUNTRY_CONFIG",
      value: {
        country: "PE",
        name: "Perú",
        tz: "America/Lima",
        locale: "es-PE",
        currency: "PEN",
      },
      description:
        "Configuración de país: zona horaria, locale, moneda. Agregar un registro por país al expandir.",
      category: "general",
    },
    {
      key: "IUBIZON_SETTINGS",
      value: {
        company_name: "IUBIZON COMPANY S.A.C.",
        ruc: "20614600374",
        department: "Lima",
        province: "Lima",
        district: "Chorrillos",
        address: "Calle las acacias, Pje. los Jazmines 181",
        google_maps_url: "https://maps.app.goo.gl/fd4ujCZW7B7WQc5X9",
        phone: "972300301",
      },
      description:
        "Datos de envío y dirección del almacén central de iubizon para envíos consolidados",
      category: "shipping",
    },
  ];

  for (const set of defaultSettings) {
    await db.platformSetting.upsert({
      where: { key: set.key },
      update: {
        value: set.value,
        description: set.description,
        category: set.category,
      },
      create: set,
    });
  }

  console.log(
    "✅ Configuraciones globales (platform_settings) verificadas/creadas correctamente.",
  );
}

main()
  .catch((e) => {
    console.error("❌ Error durante la ejecución del seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
