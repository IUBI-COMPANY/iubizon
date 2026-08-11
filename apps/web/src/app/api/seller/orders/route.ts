import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getCommissionConfig } from "@/lib/utils/commission";
import { sendDispatchNotification } from "@/lib/email";

export interface DashboardOrderItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string | null;
  status: string;
}

export interface DashboardPackage {
  packageId: string;
  orderId: string;
  companyId: string;
  companyName: string;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  carrierPhone: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  status: string;
  deliveryType: string | null;
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string | null;
  buyerDocumentType: string | null;
  buyerDocumentNumber: string | null;
  destinationAddress: string | null;
  destinationDepartment: string | null;
  destinationProvince: string | null;
  destinationDistrict: string | null;
  destinationReference: string | null;
  paymentMethod: string;
  cardBrand: string | null;
  cardLast4: string | null;
  docType: string | null;
  identityNumber: string | null;
  subtotal: number;
  platformCommission: number;
  netEarnings: number;
  items: DashboardOrderItem[];
  hasPendingRefund: boolean;
  pendingRefundType: string | null;
}

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
    let companyIdParam = searchParams.get("company_id");

    if (!companyIdParam) {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { last_active_company_id: true },
      });
      if (profile?.last_active_company_id) {
        companyIdParam = profile.last_active_company_id;
      } else {
        const firstMembership = await prisma.companyMember.findFirst({
          where: { user_id: user.id },
          select: { company_id: true },
        });
        if (firstMembership?.company_id) {
          companyIdParam = firstMembership.company_id;
        }
      }
    }

    let companyId: string | null = null;

    if (
      companyIdParam &&
      companyIdParam !== "personal" &&
      companyIdParam !== "none"
    ) {
      const membership = await prisma.companyMember.findFirst({
        where: { company_id: companyIdParam, user_id: user.id },
      });
      if (!membership) {
        return NextResponse.json(
          { error: "No tienes permisos para ver las ventas de esta empresa." },
          { status: 403 },
        );
      }
      companyId = companyIdParam;
    }

    const packages = await prisma.orderPackage.findMany({
      where: companyId ? { company_id: companyId } : {},
      orderBy: { created_at: "desc" },
      include: {
        company: { select: { id: true, name: true } },
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true, phone: true } },
            shipping: {
              select: {
                name: true,
                phone: true,
                email: true,
                address: true,
                department: true,
                province: true,
                district: true,
                reference: true,
                document_type: true,
                document_number: true,
              },
            },
            payment_method: true,
            paymentTransaction: {
              select: { card_brand: true, card_last4: true },
            },
            invoice: {
              select: { type: true, number: true, doc_type: true },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    const orderIds = [...new Set(packages.map((p) => p.order_id))];
    const pendingRefunds =
      orderIds.length > 0
        ? await prisma.refundRequest.findMany({
            where: {
              order_id: { in: orderIds },
              status: {
                in: [
                  "pending",
                  "approved",
                  "return_in_transit",
                  "return_received",
                ],
              },
            },
            select: { order_id: true, type: true, status: true },
          })
        : [];

    const result: DashboardPackage[] = packages.map((pkg) => {
      const order = pkg.order;
      const buyer = order.buyer;

      return {
        packageId: pkg.id,
        orderId: pkg.order_id,
        companyId: pkg.company_id,
        companyName: pkg.company?.name || "Vendedor",
        trackingNumber: pkg.tracking_number,
        courier: pkg.courier,
        trackingUrl: pkg.tracking_url,
        carrierPhone: pkg.carrier_phone,
        estimatedDelivery: pkg.estimated_delivery?.toISOString() || null,
        createdAt: pkg.created_at?.toISOString() || new Date().toISOString(),
        status: pkg.status,
        deliveryType: pkg.delivery_type,
        buyerName: order.shipping?.name || buyer?.name || "Comprador",
        buyerPhone: order.shipping?.phone || buyer?.phone || null,
        buyerEmail: order.shipping?.email || buyer?.email || null,
        buyerDocumentType: order.shipping?.document_type || null,
        buyerDocumentNumber: order.shipping?.document_number || null,
        destinationAddress: pkg.destination_address,
        destinationDepartment: order.shipping?.department || null,
        destinationProvince: order.shipping?.province || null,
        destinationDistrict: order.shipping?.district || null,
        destinationReference: order.shipping?.reference || null,
        paymentMethod: order.payment_method || "cash_on_delivery",
        cardBrand: order.paymentTransaction?.card_brand || null,
        cardLast4: order.paymentTransaction?.card_last4 || null,
        docType: order.invoice?.doc_type || null,
        identityNumber: order.invoice?.number || null,
        subtotal: Number(pkg.subtotal),
        platformCommission: Number(pkg.commission_total),
        netEarnings: Number(pkg.net_earnings),
        items: pkg.items.map((item) => ({
          id: item.id,
          productId: item.product_id,
          title: item.product.title,
          price: Number(item.unit_price),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
          image: item.product.images[0]?.url || null,
          status: item.status,
        })),
        hasPendingRefund: pendingRefunds.some(
          (r) => r.order_id === pkg.order_id,
        ),
        pendingRefundType:
          pendingRefunds.find((r) => r.order_id === pkg.order_id)?.type ?? null,
      };
    });

    const commissionConfig = await getCommissionConfig();

    return NextResponse.json({
      packages: result,
      totalCount: result.length,
      commission: {
        baseRate: commissionConfig.base_rate,
        fixedFee: commissionConfig.fixed_fee,
        threshold: commissionConfig.threshold_amount,
      },
    });
  } catch (err: unknown) {
    console.error("Error al obtener ventas del vendedor:", err);
    return NextResponse.json(
      { error: "Error al obtener ventas" },
      { status: 500 },
    );
  }
}

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
    const {
      packageId,
      action,
      courier: carrierName,
      trackingNumber,
      trackingUrl,
      carrierPhone,
      estimatedDelivery,
    } = body;

    if (!packageId) {
      return NextResponse.json(
        { error: "Falta el ID del paquete" },
        { status: 400 },
      );
    }

    const pkg = await prisma.orderPackage.findUnique({
      where: { id: packageId },
      include: {
        company: {
          include: {
            companyMembers: { where: { user_id: user.id } },
          },
        },
      },
    });

    if (!pkg || pkg.company.companyMembers.length === 0) {
      return NextResponse.json(
        { error: "No autorizado para este paquete" },
        { status: 403 },
      );
    }

    if (action === "cancel") {
      await prisma.orderPackage.update({
        where: { id: packageId },
        data: { status: "cancelled", updated_at: new Date() },
      });
      await prisma.orderItem.updateMany({
        where: { package_id: packageId },
        data: { status: "cancelled", updated_at: new Date() },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "mark_shipped") {
      if (!carrierName) {
        return NextResponse.json(
          { error: "La empresa de transporte es requerida" },
          { status: 400 },
        );
      }
      if (!trackingNumber || !String(trackingNumber).trim()) {
        return NextResponse.json(
          { error: "El Código de Tracking / Guía es requerido" },
          { status: 400 },
        );
      }
      if (!estimatedDelivery) {
        return NextResponse.json(
          { error: "La Fecha Estimada de Entrega es requerida" },
          { status: 400 },
        );
      }

      const estDeliveryDate = new Date(estimatedDelivery);

      await prisma.orderPackage.update({
        where: { id: packageId },
        data: {
          status: "shipped",
          courier: carrierName,
          tracking_number: trackingNumber.trim(),
          tracking_url: trackingUrl || null,
          carrier_phone: carrierPhone || null,
          estimated_delivery: estDeliveryDate,
          updated_at: new Date(),
        },
      });

      await prisma.orderItem.updateMany({
        where: { package_id: packageId },
        data: { status: "shipped", updated_at: new Date() },
      });

      // Notificar al comprador que su pedido fue despachado
      sendDispatchNotification(
        packageId,
        carrierName,
        trackingNumber.trim(),
        trackingUrl || null,
        estDeliveryDate,
      ).catch((err) =>
        console.error(
          "[Seller Orders] Error enviando notificación de despacho:",
          err,
        ),
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Error al actualizar despacho:", err);
    const message = err instanceof Error ? err.message : "Error interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
