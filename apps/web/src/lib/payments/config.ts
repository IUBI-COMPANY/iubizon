import { prisma } from "@/lib/prisma";

export interface PaymentProvidersConfig {
  /** Lista de ids de proveedores habilitados (orden de aparición). */
  enabled: string[];
  /** Credenciales/config por proveedor (ej. { niubiz: {...}, culqi: {...} }). */
  providers: Record<string, Record<string, unknown>>;
}

const DEFAULT_CONFIG: PaymentProvidersConfig = {
  enabled: ["niubiz"],
  providers: {},
};

/**
 * Lee la configuración de proveedores de pago desde `platform_settings`
 * (key `PAYMENT_PROVIDERS`). Administrable desde el panel admin.
 */
export async function getPaymentProvidersConfig(): Promise<PaymentProvidersConfig> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "PAYMENT_PROVIDERS" },
    });
    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const val = setting.value as Record<string, any>;
      return {
        enabled: Array.isArray(val.enabled)
          ? val.enabled.map(String)
          : DEFAULT_CONFIG.enabled,
        providers:
          val.providers && typeof val.providers === "object"
            ? (val.providers as Record<string, Record<string, unknown>>)
            : {},
      };
    }
  } catch (err) {
    console.error("Error al leer PAYMENT_PROVIDERS:", err);
  }

  return DEFAULT_CONFIG;
}
