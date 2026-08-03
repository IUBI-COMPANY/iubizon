export interface CommissionRuleConfig {
  base_rate: number;       // ej. 0.09 (9%)
  fixed_fee: number;       // ej. 2.50
  threshold_amount: number; // ej. 40.00
}

const DEFAULT_COMMISSION_CONFIG: CommissionRuleConfig = {
  base_rate: 0.09,
  fixed_fee: 2.50,
  threshold_amount: 40.00,
};

/**
 * Función centralizada y dinámica para calcular la comisión de la plataforma Iubizon.
 * 
 * Permite usar la regla predeterminada o configuraciones dinámicas desde la tabla `platform_settings`
 * modificable por Administradores / SuperAdministradores desde el panel de control.
 */
export function calculateIubizonCommission(
  amount: number,
  config: CommissionRuleConfig = DEFAULT_COMMISSION_CONFIG
): number {
  if (amount <= 0) return 0;
  
  const baseRate = config.base_rate ?? 0.09;
  const fixedFee = config.fixed_fee ?? 2.50;
  const threshold = config.threshold_amount ?? 40.00;

  if (amount < threshold) {
    return Number(((amount * baseRate) + fixedFee).toFixed(2));
  }
  return Number((amount * baseRate).toFixed(2));
}

