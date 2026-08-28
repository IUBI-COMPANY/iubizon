import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  resolveSellerCompanyId,
  getSellerOrders,
  updateSellerShipment,
  markSellerOrdersShipped,
  cancelSellerPackage,
  updateSellerPackageStatus,
  type DashboardOrderItem,
  type SellerOrderShipment,
  type SellerOrder,
  type UpdateShipmentPayload,
  type MarkShippedPayload,
} from "@/lib/services/seller-orders";

// Re-export types for backward compatibility across frontend components
export type {
  DashboardOrderItem,
  SellerOrderShipment,
  SellerOrder,
  UpdateShipmentPayload,
  MarkShippedPayload,
};

/**
 * GET /api/seller/orders
 * Retorna las órdenes de venta consolidadas y sus guías de despacho.
 */
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get("company_id");

    const companyId = await resolveSellerCompanyId(user.id, companyIdParam);

    if (!companyId) {
      return NextResponse.json({
        orders: [],
        packages: [],
        totalCount: 0,
        commission: { baseRate: 0.1, fixedFee: 0, threshold: 40 },
      });
    }

    const { orders, commission } = await getSellerOrders(companyId);

    return NextResponse.json({
      orders,
      packages: orders,
      totalCount: orders.length,
      commission,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API seller/orders GET] Error:", msg, err);
    return NextResponse.json(
      { error: `Error al obtener ventas: ${msg}` },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/seller/orders
 * Gestiona despachos, actualizaciones de guía, cancelaciones y cambios de estado.
 */
export async function PATCH(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { packageId, action, status } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "ID de paquete requerido" },
        { status: 400 },
      );
    }

    const companyId = await resolveSellerCompanyId(user.id);
    if (!companyId) {
      return NextResponse.json(
        { error: "No tienes una empresa activa asignada" },
        { status: 403 },
      );
    }

    switch (action) {
      case "update_shipment": {
        const updated = await updateSellerShipment(packageId, companyId, {
          courier: body.courier,
          trackingNumber: body.trackingNumber,
          trackingUrl: body.trackingUrl,
          carrierPhone: body.carrierPhone,
          estimatedDelivery: body.estimatedDelivery,
        });
        return NextResponse.json({ success: true, package: updated });
      }

      case "mark_shipped": {
        const result = await markSellerOrdersShipped(packageId, companyId, {
          carrierName: body.carrierName,
          trackingNumber: body.trackingNumber,
          estimatedDelivery: body.estimatedDelivery,
          trackingUrl: body.trackingUrl,
          carrierPhone: body.carrierPhone,
          shipments: body.shipments,
        });
        return NextResponse.json({ success: true, ...result });
      }

      case "cancel_package": {
        const result = await cancelSellerPackage(packageId, companyId);
        return NextResponse.json(result);
      }

      case "update_status": {
        if (!status) {
          return NextResponse.json(
            { error: "Estado no proporcionado" },
            { status: 400 },
          );
        }
        const updated = await updateSellerPackageStatus(
          packageId,
          companyId,
          status,
        );
        return NextResponse.json({ success: true, package: updated });
      }

      default:
        return NextResponse.json(
          { error: "Acción no válida" },
          { status: 400 },
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error interno";
    console.error("[API seller/orders PATCH] Error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
