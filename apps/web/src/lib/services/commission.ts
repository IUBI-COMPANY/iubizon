import { prisma } from "@/lib/prisma";
import type { CommissionConfig } from "@/lib/utils/financials";

export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  base_rate: 0.09,
  fixed_fee: 2.5,
  threshold_amount: 40.0,
};

let cachedConfig: CommissionConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

/**
 * Obtiene la configuración de comisión de la plataforma desde la base de datos (Server-side).
 */
export async function getCommissionConfig(): Promise<CommissionConfig> {
  if (cachedConfig && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedConfig;
  }

  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "COMMISSION_CONFIG" },
    });

    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const val = setting.value as Record<string, unknown>;
      const rawRate = typeof val.base_rate === "number" ? val.base_rate : 0.09;
      cachedConfig = {
        base_rate: rawRate > 1 ? rawRate / 100 : rawRate,
        fixed_fee: typeof val.fixed_fee === "number" ? val.fixed_fee : 2.5,
        threshold_amount:
          typeof val.threshold_amount === "number"
            ? val.threshold_amount
            : 40.0,
      };
      cacheTimestamp = Date.now();
      return cachedConfig;
    }
  } catch (err) {
    console.error("Error al leer COMMISSION_CONFIG:", err);
  }

  return DEFAULT_COMMISSION_CONFIG;
}
