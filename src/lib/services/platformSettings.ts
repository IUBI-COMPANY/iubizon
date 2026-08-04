import { prisma } from "@/lib/prisma";

export interface ShippingConfig {
  is_free: boolean;
  default_cost: number;
  promotion_label?: string;
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "SHIPPING_CONFIG" },
    });

    if (setting && setting.value && typeof setting.value === "object") {
      const val = setting.value as Record<string, any>;
      return {
        is_free: Boolean(val.is_free ?? true),
        default_cost: Number(val.default_cost ?? 0.0),
        promotion_label:
          val.promotion_label || "Promoción de Lanzamiento (Envío GRATIS)",
      };
    }
  } catch (err) {
    console.error(
      "Error al consultar SHIPPING_CONFIG en platform_settings:",
      err,
    );
  }

  // Fallback seguro por defecto si aún no está insertado en BD
  return {
    is_free: true,
    default_cost: 0.0,
    promotion_label: "Promoción de Lanzamiento (Envío GRATIS)",
  };
}
