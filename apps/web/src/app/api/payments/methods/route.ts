import { NextResponse } from "next/server";
import { getPaymentProvidersConfig } from "@/lib/payments/config";

/**
 * Lista de métodos de pago habilitados para el frontend.
 * GET /api/payments/methods
 */
export async function GET() {
  const config = await getPaymentProvidersConfig();
  return NextResponse.json({ enabled: config.enabled });
}
