/**
 * Helper utilities para formato y parseo de metadatos de despacho y seguimiento
 */

export interface ParsedDispatchMeta {
  carrierName: string | null;
  trackingUrl: string | null;
  carrierPhone: string | null;
}

export function parseDispatchMeta(rawCourier?: string | null): ParsedDispatchMeta {
  if (!rawCourier || !rawCourier.trim()) {
    return { carrierName: null, trackingUrl: null, carrierPhone: null };
  }

  const trimmed = rawCourier.trim();

  // Si contiene notas o datos del cliente/comprobante guardados en el campo courier, ignorarlos
  if (
    trimmed.startsWith("Cliente:") ||
    trimmed.includes("Boleta") ||
    trimmed.includes("Factura") ||
    trimmed.includes("DNI:") ||
    trimmed.includes("RUC:") ||
    trimmed.includes("Tel:")
  ) {
    return { carrierName: null, trackingUrl: null, carrierPhone: null };
  }

  if (!trimmed.includes("[DESPACHO]")) {
    return { carrierName: trimmed, trackingUrl: null, carrierPhone: null };
  }

  let carrierName: string | null = null;
  let trackingUrl: string | null = null;
  let carrierPhone: string | null = null;

  const parts = trimmed.split("|").map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith("Carrier:")) {
      const val = part.replace("Carrier:", "").trim();
      if (val && val !== "N/A") carrierName = val;
    }
    if (part.startsWith("Link:")) {
      const val = part.replace("Link:", "").trim();
      if (val && val !== "N/A") trackingUrl = val;
    }
    if (part.startsWith("CarrierTel:")) {
      const val = part.replace("CarrierTel:", "").trim();
      if (val && val !== "N/A") carrierPhone = val;
    }
  }

  if (!carrierName && trimmed && !trimmed.startsWith("[DESPACHO]")) {
    carrierName = trimmed;
  }

  return { carrierName, trackingUrl, carrierPhone };
}

export function formatDispatchMeta(params: {
  courier: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  carrierPhone?: string | null;
}): string {
  const { courier, trackingNumber, trackingUrl, carrierPhone } = params;
  return `[DESPACHO] | Carrier: ${courier.trim()} | Tracking: ${trackingNumber.trim()} | Link: ${trackingUrl ? trackingUrl.trim() : "N/A"} | CarrierTel: ${carrierPhone ? carrierPhone.trim() : "N/A"}`;
}
