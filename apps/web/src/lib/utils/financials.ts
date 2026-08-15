import { prisma } from "@/lib/prisma";

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface CommissionConfig {
  base_rate: number;
  fixed_fee: number;
  threshold_amount: number;
}

export interface PackageItemsInput {
  unitPrice: number;
  quantity: number;
}

export interface PackageFinancials {
  subtotal: number;
  commission: number;
  netEarnings: number;
}

export interface ItemFinancials {
  subtotal: number;
  commission: number;
}

export interface OrderFinancials {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  platformCommission: number;
  sellerEarnings: number;
  totalAmount: number;
}

// ═══════════════════════════════════════════════════════════════════════
// CONFIG — Caché de 1 minuto desde platform_settings
// ═══════════════════════════════════════════════════════════════════════

const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  base_rate: 0.09,
  fixed_fee: 2.5,
  threshold_amount: 40.0,
};

let cachedConfig: CommissionConfig | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60_000;

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

// ═══════════════════════════════════════════════════════════════════════
// CÁLCULOS BÁSICOS
// ═══════════════════════════════════════════════════════════════════════

/** Comisión de la plataforma según regla dinámica */
export function calculateCommission(
  amount: number,
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG,
): number {
  if (amount <= 0) return 0;
  if (amount < config.threshold_amount) {
    return Number((amount * config.base_rate + config.fixed_fee).toFixed(2));
  }
  return Number((amount * config.base_rate).toFixed(2));
}

/** Subtotal de un item: precio × cantidad */
export function itemSubtotal(unitPrice: number, quantity: number): number {
  return Number((unitPrice * quantity).toFixed(2));
}

/** Comisión proporcional de un item dentro de su paquete (sin double-threshold) */
export function itemCommission(
  itemSubtotalValue: number,
  packageSubtotal: number,
  packageCommission: number,
): number {
  if (packageSubtotal <= 0) return 0;
  return Number(
    ((itemSubtotalValue / packageSubtotal) * packageCommission).toFixed(2),
  );
}

// ═══════════════════════════════════════════════════════════════════════
// CÁLCULOS AGREGADOS (PAQUETE / ORDEN)
// ═══════════════════════════════════════════════════════════════════════

/** Calcula subtotal, comisión y neto de un paquete */
export function computePackageFinancials(
  items: PackageItemsInput[],
  config: CommissionConfig = DEFAULT_COMMISSION_CONFIG,
): PackageFinancials {
  const subtotal = items.reduce(
    (sum, i) => sum + itemSubtotal(i.unitPrice, i.quantity),
    0,
  );
  const commission = calculateCommission(subtotal, config);
  return {
    subtotal,
    commission,
    netEarnings: Number((subtotal - commission).toFixed(2)),
  };
}

/** Calcula los financials de un item dentro de su paquete (proporcional) */
export function computeItemFinancials(
  unitPrice: number,
  quantity: number,
  packageSubtotal: number,
  packageCommission: number,
): ItemFinancials {
  const subtotal = itemSubtotal(unitPrice, quantity);
  const commission = itemCommission(
    subtotal,
    packageSubtotal,
    packageCommission,
  );
  return { subtotal, commission };
}

/** Agrega financials de todos los paquetes de una orden */
export function aggregateOrderFinancials(
  packages: Array<{
    subtotal?: unknown;
    commission_total?: unknown;
    net_earnings?: unknown;
  }>,
  shippingCost: number = 0,
  taxAmount: number = 0,
): OrderFinancials {
  const subtotal = packages.reduce((sum, pkg) => {
    if (typeof pkg.subtotal !== "undefined" && pkg.subtotal !== null) {
      return sum + Number(pkg.subtotal);
    }
    return (
      sum + Number(pkg.commission_total || 0) + Number(pkg.net_earnings || 0)
    );
  }, 0);
  const platformCommission = packages.reduce(
    (sum, pkg) => sum + Number(pkg.commission_total || 0),
    0,
  );
  const sellerEarnings = packages.reduce(
    (sum, pkg) => sum + Number(pkg.net_earnings || 0),
    0,
  );

  return {
    subtotal,
    shippingCost,
    taxAmount,
    platformCommission,
    sellerEarnings,
    totalAmount: subtotal + shippingCost + taxAmount,
  };
}
