// ═══════════════════════════════════════════════════════════════════════
// TYPES (PURE - SAFE FOR CLIENT & SERVER)
// ═══════════════════════════════════════════════════════════════════════

export interface CommissionConfig {
  base_rate: number;
  fixed_fee: number;
  threshold_amount: number;
}

export interface CompanyCommissionInput {
  tax_id?: string | null;
  name?: string | null;
  custom_commission_rate?: number | string | unknown;
  custom_commission_until?: Date | string | null;
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

export const DEFAULT_COMMISSION_CONFIG: CommissionConfig = {
  base_rate: 0.09,
  fixed_fee: 2.5,
  threshold_amount: 40.0,
};

/**
 * Resuelve de forma modular, pura y aislada la regla de comisión aplicable a una empresa,
 * evaluando beneficios preferenciales por tiempo limitado o indefinidos, la exención propia de IUBIZON
 * y fallback seguro a la regla estándar del marketplace.
 */
export function resolveCompanyCommissionConfig(
  company: CompanyCommissionInput | null | undefined,
  globalConfig: CommissionConfig = DEFAULT_COMMISSION_CONFIG,
  nowDate: Date = new Date(),
): CommissionConfig {
  if (!company) {
    return globalConfig;
  }

  // 1. Evaluación de comisión preferencial/personalizada asignada por el Administrador
  const parsedRate = normalizeCommissionRate(company.custom_commission_rate);
  if (parsedRate !== null) {
    const untilDate = company.custom_commission_until
      ? new Date(company.custom_commission_until)
      : null;

    // Si es indefinido (null) o si la fecha actual es anterior a la fecha de vencimiento
    if (!untilDate || isNaN(untilDate.getTime()) || untilDate > nowDate) {
      return {
        ...globalConfig,
        base_rate: parsedRate,
        fixed_fee: parsedRate === 0 ? 0 : globalConfig.fixed_fee,
      };
    }
  }

  // 2. Exención para la empresa matriz IUBIZON (RUC 20614600374 o razón social IUBIZON)
  const isIubizon =
    company.tax_id === "20614600374" ||
    (typeof company.name === "string" &&
      company.name.toLowerCase().includes("iubizon"));

  if (isIubizon) {
    return {
      ...globalConfig,
      base_rate: 0,
      fixed_fee: 0,
    };
  }

  // 3. Regla global predeterminada de la plataforma
  return globalConfig;
}

// ═══════════════════════════════════════════════════════════════════════
// NORMALIZACIÓN Y FORMATO UNIFICADO DE TASAS (ESTÁNDAR 0.0500)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Normaliza cualquier valor de tasa a formato decimal estándar de 4 decimales (ej: 0.0500 para 5%).
 */
export function normalizeCommissionRate(
  rawRate: number | string | null | undefined | unknown,
): number | null {
  if (
    rawRate === null ||
    rawRate === undefined ||
    String(rawRate).trim() === ""
  ) {
    return null;
  }
  const num = Number(rawRate);
  if (isNaN(num) || num < 0) return null;
  const rate = num > 1 ? num / 100 : num;
  return Number(rate.toFixed(4));
}

/**
 * Formatea una tasa decimal (ej: 0.0500) para mostrar en etiquetas uniformes en Web, Admin y Correos.
 * Ejemplo: 0.0500 -> "0.0500 (5%)" | 0.0000 -> "0.0000 (0% Promoción)"
 */
export function formatCommissionRateLabel(rate: number): string {
  const normalized = Number(rate.toFixed(4));
  if (normalized === 0) {
    return "0.0000 (0% Promoción)";
  }
  const pct = (normalized * 100).toFixed(0);
  return `${normalized.toFixed(4)} (${pct}%)`;
}

// ═══════════════════════════════════════════════════════════════════════
// MANEJO GENÉRICO Y GLOBAL DE FECHAS EN UTC (100% TIMEZONE INVARIANT)
// ═══════════════════════════════════════════════════════════════════════

/**
 * Convierte una fecha YYYY-MM-DD al timestamp UTC exacto de fin de día (23:59:59.999Z).
 * Totalmente agnóstico e independiente de la zona horaria del cliente o servidor.
 */
export function parseDateToUTCEndOfDay(dateStr?: string | null): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const parts = dateStr.trim().split("-");
  if (parts.length !== 3) return null;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  const utcDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
  return utcDate.toISOString();
}

/**
 * Formatea cualquier marca de tiempo a YYYY-MM-DD en UTC universal.
 */
export function formatUTCDateToInput(dateInput?: Date | string | null): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  } catch {
    return "";
  }
}

/**
 * Formatea cualquier marca de tiempo a DD/MM/YYYY en UTC universal.
 */
export function formatUTCDateToDisplay(
  dateInput?: Date | string | null,
): string {
  if (!dateInput) return "";
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DINÁMICA DE LA PLATAFORMA
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
