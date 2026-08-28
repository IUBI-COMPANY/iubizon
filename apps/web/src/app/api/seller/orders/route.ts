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
  orderCode: string;
  packageNumber: number;
  totalPackages: number;
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
  commissionRate?: number;
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
    const companyIdParam = searchParams.get("company_id");

    let companyId: string | null = null;

    if (
      companyIdParam &&
      companyIdParam !== "personal" &&
      companyIdParam !== "none"
    ) {
      const membership = await prisma.companyMember.findFirst({
        where: { company_id: companyIdParam, user_id: user.id },
      });
      if (membership) {
        companyId = companyIdParam;
      }
    }

    if (!companyId) {
      const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        select: { last_active_company_id: true },
      });

      if (profile?.last_active_company_id) {
        const isMember = await prisma.companyMember.findFirst({
          where: {
            company_id: profile.last_active_company_id,
            user_id: user.id,
          },
        });
        if (isMember) {
          companyId = profile.last_active_company_id;
        }
      }

      if (!companyId) {
        const firstMembership = await prisma.companyMember.findFirst({
          where: { user_id: user.id },
          select: { company_id: true },
        });
        if (firstMembership?.company_id) {
          companyId = firstMembership.company_id;
        }
      }
    }

    // Seguridad: un usuario sin empresa (ni membresía) no debe ver ninguna venta.
    if (!companyId) {
      const commissionConfig = await getCommissionConfig();
      return NextResponse.json({
        packages: [],
        totalCount: 0,
        commission: {
          baseRate: commissionConfig.base_rate,
          fixedFee: commissionConfig.fixed_fee,
          threshold: commissionConfig.threshold_amount,
        },
      });
    }

    const packages = await prisma.orderPackage.findMany({
      where: { company_id: companyId },
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

    const commissionConfig = await getCommissionConfig();

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
      const order = pkg.order || ({} as any);
      const buyer: any = order.buyer || {};
      const shipping: any = order.shipping || {};
      const paymentTransaction: any = order.paymentTransaction || {};
      const invoice: any = order.invoice || {};

      const pkgSubtotal = Number(pkg.subtotal || 0);
      const pkgCommissionTotal = Number(pkg.commission_total || 0);

      const rawRate =
        pkgSubtotal > 0
          ? Number((pkgCommissionTotal / pkgSubtotal).toFixed(4))
          : commissionConfig.base_rate;

      const pkgCommissionRate = rawRate > 1 ? rawRate / 100 : rawRate;

      return {
        packageId: pkg.id,
        orderId: pkg.order_id,
        orderCode: order.order_code || `#${pkg.order_id.slice(0, 8)}`,
        packageNumber: pkg.package_number ?? 1,
        totalPackages: pkg.total_packages ?? 1,
        companyId: pkg.company_id,
        companyName: pkg.company?.name || "Vendedor",
        trackingNumber: pkg.tracking_number,
        courier: pkg.courier,
        trackingUrl: pkg.tracking_url,
        carrierPhone: pkg.carrier_phone,
        estimatedDelivery: pkg.estimated_delivery
          ? new Date(pkg.estimated_delivery).toISOString()
          : null,
        createdAt: pkg.created_at
          ? new Date(pkg.created_at).toISOString()
          : new Date().toISOString(),
        status: pkg.status,
        deliveryType: pkg.delivery_type,
        buyerName: shipping.name || buyer.name || "Comprador",
        buyerPhone: shipping.phone || buyer.phone || null,
        buyerEmail: shipping.email || buyer.email || null,
        buyerDocumentType: shipping.document_type || null,
        buyerDocumentNumber: shipping.document_number || null,
        destinationAddress: pkg.destination_address,
        destinationDepartment: shipping.department || null,
        destinationProvince: shipping.province || null,
        destinationDistrict: shipping.district || null,
        destinationReference: shipping.reference || null,
        paymentMethod: order.payment_method || "cash_on_delivery",
        cardBrand: paymentTransaction.card_brand || null,
        cardLast4: paymentTransaction.card_last4 || null,
        docType: invoice.doc_type || null,
        identityNumber: invoice.number || null,
        subtotal: Number(pkg.subtotal || 0),
        platformCommission: Number(pkg.commission_total || 0),
        commissionRate: pkgCommissionRate,
        netEarnings: Number(pkg.net_earnings || 0),
        items: (pkg.items || []).map((item) => ({
          id: item.id,
          productId: item.product_id,
          title: item.product?.title || "Producto",
          price: Number(item.unit_price || 0),
          quantity: item.quantity || 1,
          subtotal: Number(item.subtotal || 0),
          image: item.product?.images?.[0]?.url || null,
          status: item.status,
        })),
        hasPendingRefund: pendingRefunds.some(
          (r) => r.order_id === pkg.order_id,
        ),
        pendingRefundType:
          pendingRefunds.find((r) => r.order_id === pkg.order_id)?.type ?? null,
      };
    });

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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[API seller/orders GET] Error:", msg, err);
    return NextResponse.json(
      { error: `Error al obtener ventas: ${msg}` },
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
        order: { select: { id: true, buyer_id: true } },
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

      const pkgItems = await prisma.orderItem.findMany({
        where: { package_id: packageId },
        select: {
          id: true,
          product_id: true,
          quantity: true,
          unit_price: true,
          subtotal: true,
        },
      });

      // 1. Reintegrar stock al vendedor
      for (const item of pkgItems) {
        if (item.product_id) {
          await prisma.product.update({
            where: { id: item.product_id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // 2. Crear solicitud de reembolso automática para devolución al comprador por la administración
      if (pkg.order?.id && pkg.order?.buyer_id) {
        const existingRefund = await prisma.refundRequest.findFirst({
          where: {
            order_id: pkg.order.id,
            status: {
              in: ["pending", "approved", "return_received", "refunded"],
            },
          },
        });

        if (!existingRefund) {
          const packageSubtotal = pkgItems.reduce(
            (acc, i) => acc + Number(i.subtotal || 0),
            0,
          );
          const refundAmt =
            packageSubtotal > 0 ? packageSubtotal : Number(pkg.subtotal || 0);

          await prisma.refundRequest.create({
            data: {
              order_id: pkg.order.id,
              buyer_id: pkg.order.buyer_id,
              reason:
                "Cancelado por la empresa vendedora (Imposibilidad de despacho)",
              type: "full",
              refund_amount: refundAmt,
              platform_fee: 0,
              net_refund: refundAmt,
              status: "pending",
              items: {
                create: pkgItems.map((item) => ({
                  order_item_id: item.id,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  subtotal: item.subtotal,
                })),
              },
            },
          });
        }
      }

      return NextResponse.json({ success: true });
    }

    if (action === "mark_shipped") {
      const shipments: Array<{
        courier: string;
        trackingNumber: string;
        trackingUrl?: string | null;
        carrierPhone?: string | null;
        estimatedDelivery: string;
        items: Array<{
          id?: string;
          productId?: string;
          quantity: number;
        }>;
      }> = body.shipments;

      if (shipments && Array.isArray(shipments) && shipments.length > 1) {
        const existingItems = await prisma.orderItem.findMany({
          where: { package_id: packageId },
          include: { product: true },
        });

        const totalPackages = shipments.length;

        await prisma.$transaction(async (tx) => {
          // Bulto 1: Actualiza el paquete original
          const s1 = shipments[0];
          const estDate1 = new Date(s1.estimatedDelivery);

          let s1Subtotal = 0;
          let s1Commission = 0;

          await tx.orderItem.deleteMany({
            where: { package_id: packageId },
          });

          for (const itemInput of s1.items) {
            const orig = existingItems.find(
              (i) =>
                i.id === itemInput.id ||
                i.product_id === itemInput.productId ||
                i.product_id === itemInput.id,
            );
            if (orig && itemInput.quantity > 0) {
              const uPrice = Number(orig.unit_price);
              const qty = Number(itemInput.quantity);
              const itemSub = uPrice * qty;
              const commissionRate =
                pkg.commission_rate !== null &&
                pkg.commission_rate !== undefined
                  ? Number(pkg.commission_rate)
                  : 0.1;
              const itemCom = itemSub * commissionRate;

              s1Subtotal += itemSub;
              s1Commission += itemCom;

              await tx.orderItem.create({
                data: {
                  package_id: packageId,
                  product_id: orig.product_id,
                  quantity: qty,
                  unit_price: uPrice,
                  subtotal: itemSub,
                  commission: itemCom,
                  status: "shipped",
                  tracking_number: s1.trackingNumber.trim(),
                },
              });
            }
          }

          const s1Net = Math.max(0, s1Subtotal - s1Commission);

          await tx.orderPackage.update({
            where: { id: packageId },
            data: {
              package_number: 1,
              total_packages: totalPackages,
              status: "shipped",
              courier: s1.courier,
              tracking_number: s1.trackingNumber.trim(),
              tracking_url: s1.trackingUrl || null,
              carrier_phone: s1.carrierPhone || null,
              estimated_delivery: estDate1,
              subtotal: s1Subtotal,
              commission_total: s1Commission,
              net_earnings: s1Net,
              updated_at: new Date(),
            },
          });

          // Bultos 2..N: Crear nuevos paquetes vinculados a la misma orden y tienda
          for (let i = 1; i < shipments.length; i++) {
            const si = shipments[i];
            const estDateI = new Date(si.estimatedDelivery);

            let siSubtotal = 0;
            let siCommission = 0;

            const newPkg = await tx.orderPackage.create({
              data: {
                order_id: pkg.order_id,
                company_id: pkg.company_id,
                package_number: i + 1,
                total_packages: totalPackages,
                status: "shipped",
                delivery_type: pkg.delivery_type,
                destination_address: pkg.destination_address,
                courier: si.courier,
                tracking_number: si.trackingNumber.trim(),
                tracking_url: si.trackingUrl || null,
                carrier_phone: si.carrierPhone || null,
                estimated_delivery: estDateI,
                commission_rate: pkg.commission_rate,
                subtotal: 0,
                commission_total: 0,
                net_earnings: 0,
              },
            });

            for (const itemInput of si.items) {
              const orig = existingItems.find(
                (item) =>
                  item.id === itemInput.id ||
                  item.product_id === itemInput.productId ||
                  item.product_id === itemInput.id,
              );
              if (orig && itemInput.quantity > 0) {
                const uPrice = Number(orig.unit_price);
                const qty = Number(itemInput.quantity);
                const itemSub = uPrice * qty;
                const commissionRate =
                  pkg.commission_rate !== null &&
                  pkg.commission_rate !== undefined
                    ? Number(pkg.commission_rate)
                    : 0.1;
                const itemCom = itemSub * commissionRate;

                siSubtotal += itemSub;
                siCommission += itemCom;

                await tx.orderItem.create({
                  data: {
                    package_id: newPkg.id,
                    product_id: orig.product_id,
                    quantity: qty,
                    unit_price: uPrice,
                    subtotal: itemSub,
                    commission: itemCom,
                    status: "shipped",
                    tracking_number: si.trackingNumber.trim(),
                  },
                });
              }
            }

            const siNet = Math.max(0, siSubtotal - siCommission);
            await tx.orderPackage.update({
              where: { id: newPkg.id },
              data: {
                subtotal: siSubtotal,
                commission_total: siCommission,
                net_earnings: siNet,
              },
            });
          }

          // Actualizar estado de la orden global si todos los paquetes están despachados
          const remainingNonShipped = await tx.orderPackage.count({
            where: {
              order_id: pkg.order_id,
              status: { notIn: ["shipped", "delivered", "completed"] },
            },
          });
          if (remainingNonShipped === 0) {
            await tx.order.update({
              where: { id: pkg.order_id },
              data: { status: "shipped", updated_at: new Date() },
            });
          }
        });

        sendDispatchNotification(
          packageId,
          shipments[0].courier,
          shipments[0].trackingNumber.trim(),
          shipments[0].trackingUrl || null,
          new Date(shipments[0].estimatedDelivery),
        ).catch((err) =>
          console.error(
            "[Seller Orders] Error enviando notificación de despacho fraccionado:",
            err,
          ),
        );

        return NextResponse.json({ success: true, totalPackages });
      }

      // Despacho estándar de 1 bulto
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
          package_number: 1,
          total_packages: 1,
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

      const remainingNonShipped = await prisma.orderPackage.count({
        where: {
          order_id: pkg.order_id,
          status: { notIn: ["shipped", "delivered", "completed"] },
        },
      });
      if (remainingNonShipped === 0) {
        await prisma.order.update({
          where: { id: pkg.order_id },
          data: { status: "shipped", updated_at: new Date() },
        });
      }

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
