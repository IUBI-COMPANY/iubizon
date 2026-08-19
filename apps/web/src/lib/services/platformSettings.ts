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

export async function getProtectionDays(): Promise<number> {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "BUYER_PROTECTION_DAYS" },
    });
    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const val = setting.value as Record<string, unknown>;
      return typeof val.days === "number" ? val.days : 7;
    }
  } catch {}
  return 7;
}

export async function getIubizonSettings() {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "IUBIZON_SETTINGS" },
    });
    if (setting && setting.value && typeof setting.value === "object") {
      const val = setting.value as Record<string, any>;
      return {
        company_name: String(val.company_name || "IUBIZON COMPANY S.A.C."),
        ruc: String(val.ruc || "20614600374"),
        department: String(val.department || "Lima"),
        province: String(val.province || "Lima"),
        district: String(val.district || "Chorrillos"),
        address: String(val.address || "Calle las acacias, Pje. los Jazmines 181"),
        google_maps_url: String(val.google_maps_url || "https://maps.app.goo.gl/fd4ujCZW7B7WQc5X9"),
        phone: String(val.phone || "972300301"),
      };
    }
  } catch (err) {
    console.error("Error al obtener IUBIZON_SETTINGS:", err);
  }
  return {
    company_name: "IUBIZON COMPANY S.A.C.",
    ruc: "20614600374",
    department: "Lima",
    province: "Lima",
    district: "Chorrillos",
    address: "Calle las acacias, Pje. los Jazmines 181",
    google_maps_url: "https://maps.app.goo.gl/fd4ujCZW7B7WQc5X9",
    phone: "972300301",
  };
}
