import { prisma } from "@/lib/prisma";
import { getCountryConfig } from "@/lib/services/countryConfig";
import type { NiubizConfig, NiubizServiceLocationData } from "./types";

const NIUBIZ_SANDBOX_URL = "https://apisandbox.vnforappstest.com";
const NIUBIZ_PROD_URL = "https://apiprod.vnforapps.com";

const DEFAULT_SERVICE_LOCATION: NiubizServiceLocationData = {
  urlAddress: "https://iubizon.com",
  cityName: "Lima",
  countrySubdivisionCode: "LMA",
  countryCode: "PER",
  postalCode: "15023",
};

export function getNiubizBaseUrl(env: string = "sandbox"): string {
  return env === "production" ? NIUBIZ_PROD_URL : NIUBIZ_SANDBOX_URL;
}

/**
 * Obtiene las credenciales de Niubiz de forma jerárquica:
 * 1. Desde `platform_settings` en la BD (NIUBIZ_CONFIG, administrable en tiempo real).
 * 2. Fallback a Variables de Entorno.
 * 3. Fallback final a credenciales oficiales de Sandbox.
 *
 * También expone la ubicación de servicio (dataMap de autorización) y el
 * contador de registro (MDD77), ambos configurables desde NIUBIZ_CONFIG.
 */
export async function getNiubizCredentials(): Promise<NiubizConfig> {
  let dbMerchantId: string | null = null;
  let dbEnvironment: string | null = null;
  let dbRegistrationCount: number | null = null;
  let dbServiceLocation: Partial<NiubizServiceLocationData> = {};

  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "NIUBIZ_CONFIG" },
    });
    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const val = setting.value as Record<string, any>;
      if (val.merchantId) dbMerchantId = String(val.merchantId).trim();
      if (val.environment) dbEnvironment = String(val.environment).trim();
      if (typeof val.registrationCount === "number") {
        dbRegistrationCount = val.registrationCount;
      }
      if (val.serviceLocation && typeof val.serviceLocation === "object") {
        const sl = val.serviceLocation as Record<string, any>;
        dbServiceLocation = {
          urlAddress: sl.urlAddress ? String(sl.urlAddress).trim() : undefined,
          cityName: sl.cityName ? String(sl.cityName).trim() : undefined,
          countrySubdivisionCode: sl.countrySubdivisionCode
            ? String(sl.countrySubdivisionCode).trim()
            : undefined,
          countryCode: sl.countryCode
            ? String(sl.countryCode).trim()
            : undefined,
          postalCode: sl.postalCode ? String(sl.postalCode).trim() : undefined,
        };
      }
    }
  } catch (err) {
    // Continuar con fallback a variables de entorno
  }

  const envRaw = (
    dbEnvironment ||
    process.env.NIUBIZ_ENVIRONMENT ||
    "sandbox"
  ).trim();
  const environment = envRaw === "production" ? "production" : "sandbox";

  const defaultMerchantId =
    environment === "production" ? "651052554" : "341198210";
  const merchantId = (
    dbMerchantId ||
    process.env.NIUBIZ_MERCHANT_ID ||
    defaultMerchantId
  ).trim();

  const user = (
    process.env.NIUBIZ_USER || "integraciones@niubiz.com.pe"
  ).trim();
  const password = (process.env.NIUBIZ_PASSWORD || "_7592UGz").trim();

  return {
    merchantId,
    user,
    password,
    environment,
    serviceLocation: {
      ...DEFAULT_SERVICE_LOCATION,
      ...dbServiceLocation,
    },
    registrationCount: dbRegistrationCount ?? 1,
  };
}

/** Moneda dinámica según COUNTRY_CONFIG (PEN por defecto para Perú). */
export async function getNiubizCurrency(): Promise<string> {
  try {
    const cfg = await getCountryConfig();
    return cfg.currency || "PEN";
  } catch {
    return "PEN";
  }
}
