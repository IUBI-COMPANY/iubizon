import { db } from "@iubizon/db";
import type { AdminNiubizConfig } from "./types";

const NIUBIZ_SANDBOX_MERCHANT = "341198210";
const NIUBIZ_PROD_MERCHANT = "651052554";
const NIUBIZ_BASE_SANDBOX = "https://apisandbox.vnforappstest.com";
const NIUBIZ_BASE_PROD = "https://apiprod.vnforapps.com";

const NIUBIZ_PAYOUT_SANDBOX =
  "https://apitestenv.vnforapps.com/api.visadirect/sandbox/p2p";
const NIUBIZ_PAYOUT_PROD =
  "https://apiprod.vnforapps.com/api.visadirect/v2/p2p";

/**
 * Resolución centralizada de credenciales Niubiz para el admin:
 * 1. `platform_settings` (NIUBIZ_CONFIG) — administrable en tiempo real.
 * 2. Variables de entorno.
 * 3. Fallback a credenciales de sandbox.
 */
export async function getNiubizConfig(): Promise<AdminNiubizConfig> {
  const setting = await db.platformSetting.findUnique({
    where: { key: "NIUBIZ_CONFIG" },
  });

  let environment = (process.env.NIUBIZ_ENVIRONMENT || "sandbox").trim();
  let merchantId =
    environment === "production"
      ? NIUBIZ_PROD_MERCHANT
      : NIUBIZ_SANDBOX_MERCHANT;

  if (process.env.NIUBIZ_MERCHANT_ID) {
    merchantId = process.env.NIUBIZ_MERCHANT_ID.trim();
  }

  if (
    setting?.value &&
    typeof setting.value === "object" &&
    setting.value !== null
  ) {
    const val = setting.value as Record<string, any>;
    if (val.environment) environment = String(val.environment).trim();
    if (val.merchantId) merchantId = String(val.merchantId).trim();
  }

  const isProd = environment === "production";
  const baseUrl = isProd ? NIUBIZ_BASE_PROD : NIUBIZ_BASE_SANDBOX;

  return {
    environment: isProd ? "production" : "sandbox",
    merchantId,
    user: (process.env.NIUBIZ_USER || "integraciones@niubiz.com.pe").trim(),
    password: (process.env.NIUBIZ_PASSWORD || "_7592UGz").trim(),
    baseUrl,
    securityUrl: `${baseUrl}/api.security/v1/security`,
  };
}

/** URL base del endpoint de pagos P2P (Visa Direct) según entorno. */
export function getNiubizPayoutUrl(environment: string): string {
  return environment === "production"
    ? NIUBIZ_PAYOUT_PROD
    : NIUBIZ_PAYOUT_SANDBOX;
}
