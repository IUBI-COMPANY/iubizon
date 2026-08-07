import { prisma } from "@/lib/prisma";

export interface CountryConfig {
  country: string;
  name: string;
  tz: string;
  locale: string;
  currency: string;
}

const DEFAULT_CONFIG: CountryConfig = {
  country: "PE",
  name: "Perú",
  tz: "America/Lima",
  locale: "es-PE",
  currency: "PEN",
};

let cached: CountryConfig | null = null;
let cacheTs = 0;
const TTL = 120_000; // 2 minutos

/** Obtiene la configuración de país desde platform_settings con caché */
export async function getCountryConfig(): Promise<CountryConfig> {
  if (cached && Date.now() - cacheTs < TTL) return cached;

  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "COUNTRY_CONFIG" },
    });

    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const v = setting.value as Record<string, unknown>;
      cached = {
        country: String(v.country || DEFAULT_CONFIG.country),
        name: String(v.name || DEFAULT_CONFIG.name),
        tz: String(v.tz || DEFAULT_CONFIG.tz),
        locale: String(v.locale || DEFAULT_CONFIG.locale),
        currency: String(v.currency || DEFAULT_CONFIG.currency),
      };
      cacheTs = Date.now();
      return cached;
    }
  } catch (err) {
    console.error("Error al leer COUNTRY_CONFIG:", err);
  }

  return DEFAULT_CONFIG;
}
