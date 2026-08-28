/**
 * Utilidades Centralizadas para Gestión de Tracking, Códigos de Envío y Despachos en iubizon
 */

/**
 * Genera el identificador único estándar oficial de iubizon para un bulto/guía.
 * Formato: IBZ-[CODIGO_ORDEN]-[NUMERO_BULTO] (Ej. IBZ-618224-01)
 */
export function formatTrackingId(
  orderCode: string | null | undefined,
  packageNumber: number = 1,
): string {
  const cleanCode = String(orderCode || "ORD")
    .replace(/^#/, "")
    .trim();
  const pkgNum = Math.max(1, packageNumber || 1);
  return `IBZ-${cleanCode}-${String(pkgNum).padStart(2, "0")}`;
}

/**
 * Determina si una modalidad de envío o tracking corresponde a Movilidad Propia / Despacho Directo.
 */
export function isOwnMobilityCourier(
  courierOrTracking: string | null | undefined,
): boolean {
  if (!courierOrTracking) return false;
  const lower = courierOrTracking.toLowerCase();
  return lower.includes("propia") || lower.startsWith("movilidad propia");
}

/**
 * Extrae de forma segura el nombre del conductor y la placa del vehículo
 * a partir de un string de tracking de Movilidad Propia.
 */
export function parseDriverAndPlate(
  trackingString: string | null | undefined,
): { driverName: string; vehiclePlate: string } {
  if (!trackingString) {
    return { driverName: "", vehiclePlate: "" };
  }

  const matchDriver = trackingString.match(/Conductor:\s*([^|)]+)/i);
  const matchPlate = trackingString.match(/Placa:\s*([^|)]+)/i);

  return {
    driverName: matchDriver ? matchDriver[1].trim() : "",
    vehiclePlate: matchPlate ? matchPlate[1].trim().toUpperCase() : "",
  };
}

/**
 * Construye la cadena formal de tracking para despachos con Movilidad Propia.
 */
export function formatMovilidadPropiaTracking(
  driverName?: string | null,
  vehiclePlate?: string | null,
): string {
  const cleanDriver = driverName?.trim() || "Conductor por coordinar";
  const cleanPlate = vehiclePlate?.trim().toUpperCase();

  if (cleanPlate) {
    return `Movilidad Propia (Conductor: ${cleanDriver} | Placa: ${cleanPlate})`;
  }
  return `Movilidad Propia (Conductor: ${cleanDriver})`;
}

/**
 * Formatea fechas ISO a formato input datetime-local (YYYY-MM-DDTHH:mm)
 */
export function formatDateForDatetimeInput(
  dateStr?: string | null | undefined,
): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 16);
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return dateStr.slice(0, 16);
  }
}
