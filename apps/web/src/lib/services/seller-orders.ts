import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getCommissionConfig } from "@/lib/utils/commission";
import { sendDispatchNotification } from "@/lib/email";
import { formatTrackingId } from "@/lib/utils/tracking";

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

export interface SellerOrderShipment {
  packageId: string;
  packageNumber: number;
  totalPackages: number;
  trackingId: string;
  companyId: string;
  companyName: string;
  companyLegalName?: string | null;
  companyTaxId?: string | null;
  companyPhone?: string | null;
  companyLocation?: string | null;
  trackingNumber: string | null;
  courier: string | null;
  trackingUrl: string | null;
  carrierPhone: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  createdAt: string;
  status: string;
  deliveryType: string | null;
  subtotal: number;
  platformCommission: number;
  commissionRate?: number;
  netEarnings: number;
  items: DashboardOrderItem[];
}

export interface SellerOrder {
  orderId: string;
  orderCode: string;
  createdAt: string;
  companyId: string;
  companyName: string;
  companyLegalName?: string | null;
  companyTaxId?: string | null;
  companyPhone?: string | null;
  companyLocation?: string | null;
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
  status: string;
  hasPendingRefund: boolean;
  pendingRefundType: string | null;
  totalItems: number;
  items: DashboardOrderItem[];
  packages: SellerOrderShipment[];
}

export interface UpdateShipmentPayload {
  courier: string;
  trackingNumber: string;
  trackingUrl?: string | null;
  carrierPhone?: string | null;
  estimatedDelivery: string;
}

export interface MarkShippedPayload {
  carrierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  trackingUrl?: string | null;
  carrierPhone?: string | null;
  shipments?: Array<{
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
  }>;
}

/**
 * Resuelve la empresa activa asociada a un usuario vendedor.
 */
export async function resolveSellerCompanyId(
  userId: string,
  companyIdParam?: string | null,
): Promise<string | null> {
  if (
    companyIdParam &&
    companyIdParam !== "personal" &&
    companyIdParam !== "none"
  ) {
    const membership = await prisma.companyMember.findFirst({
      where: { company_id: companyIdParam, user_id: userId },
    });
    if (membership) {
      return companyIdParam;
    }
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { last_active_company_id: true },
  });

  if (profile?.last_active_company_id) {
    const isMember = await prisma.companyMember.findFirst({
      where: {
        company_id: profile.last_active_company_id,
        user_id: userId,
      },
    });
    if (isMember) {
      return profile.last_active_company_id;
    }
  }

  const firstMembership = await prisma.companyMember.findFirst({
    where: { user_id: userId },
    select: { company_id: true },
  });

  return firstMembership?.company_id ?? null;
}

/**
 * Obtiene todas las ventas consolidadas por orden con sus respectivos bultos/guías.
 */
export async function getSellerOrders(companyId: string): Promise<{
  orders: SellerOrder[];
  commission: { baseRate: number; fixedFee: number; threshold: number };
}> {
  const commissionConfig = await getCommissionConfig();

  const packages = await prisma.orderPackage.findMany({
    where: { company_id: companyId },
    orderBy: { created_at: "desc" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          legal_name: true,
          tax_id: true,
          phone: true,
          email: true,
          location: true,
        },
      },
      order: {
        select: {
          id: true,
          order_code: true,
          packages: {
            select: { id: true },
            orderBy: [{ created_at: "asc" }, { id: "asc" }],
          },
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
          delivered_at: true,
          created_at: true,
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

  const ordersMap = new Map<string, SellerOrder>();

  for (const pkg of packages) {
    const order = pkg.order || ({} as any);
    const buyer: any = order.buyer || {};
    const shipping: any = order.shipping || {};
    const paymentTransaction: any = order.paymentTransaction || {};
    const invoice: any = order.invoice || {};

    const pkgSubtotal = Number(pkg.subtotal || 0);
    const pkgCommissionTotal = Number(pkg.commission_total || 0);
    const pkgNetEarnings = Number(pkg.net_earnings || 0);

    const rawRate =
      pkgSubtotal > 0
        ? Number((pkgCommissionTotal / pkgSubtotal).toFixed(4))
        : commissionConfig.base_rate;

    const pkgCommissionRate = rawRate > 1 ? rawRate / 100 : rawRate;

    const allOrderPkgs: Array<{ id: string }> = order.packages || [];
    const globalIndex = allOrderPkgs.findIndex((p) => p.id === pkg.id);
    const pkgNum =
      globalIndex >= 0 ? globalIndex + 1 : (pkg.package_number ?? 1);
    const totalPkgs =
      allOrderPkgs.length > 0
        ? allOrderPkgs.length
        : (pkg.total_packages ?? 1);
    const orderCode = order.order_code || `#${pkg.order_id.slice(0, 8)}`;
    const trackingId = formatTrackingId(orderCode, pkgNum);

    const shipment: SellerOrderShipment = {
      packageId: pkg.id,
      packageNumber: pkgNum,
      totalPackages: totalPkgs,
      trackingId,
      companyId: pkg.company_id,
      companyName: pkg.company?.name || "Vendedor",
      companyLegalName: pkg.company?.legal_name || null,
      companyTaxId: pkg.company?.tax_id || null,
      companyPhone: pkg.company?.phone || null,
      companyLocation: pkg.company?.location || null,
      trackingNumber: pkg.tracking_number || null,
      courier: pkg.courier,
      trackingUrl: pkg.tracking_url,
      carrierPhone: pkg.carrier_phone,
      estimatedDelivery: pkg.estimated_delivery
        ? new Date(pkg.estimated_delivery).toISOString()
        : null,
      deliveredAt: order.delivered_at
        ? new Date(order.delivered_at).toISOString()
        : null,
      createdAt: pkg.created_at
        ? new Date(pkg.created_at).toISOString()
        : new Date().toISOString(),
      status: pkg.status,
      deliveryType: pkg.delivery_type,
      subtotal: pkgSubtotal,
      platformCommission: pkgCommissionTotal,
      commissionRate: pkgCommissionRate,
      netEarnings: pkgNetEarnings,
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
    };

    if (!ordersMap.has(pkg.order_id)) {
      ordersMap.set(pkg.order_id, {
        orderId: pkg.order_id,
        orderCode,
        createdAt: order.created_at
          ? new Date(order.created_at).toISOString()
          : pkg.created_at
            ? new Date(pkg.created_at).toISOString()
            : new Date().toISOString(),
        companyId: pkg.company_id,
        companyName: pkg.company?.name || "Vendedor",
        companyLegalName: pkg.company?.legal_name || null,
        companyTaxId: pkg.company?.tax_id || null,
        companyPhone: pkg.company?.phone || null,
        companyLocation: pkg.company?.location || null,
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
        subtotal: 0,
        platformCommission: 0,
        commissionRate: pkgCommissionRate,
        netEarnings: 0,
        status: pkg.status,
        hasPendingRefund: pendingRefunds.some(
          (r) => r.order_id === pkg.order_id,
        ),
        pendingRefundType:
          pendingRefunds.find((r) => r.order_id === pkg.order_id)?.type ?? null,
        totalItems: 0,
        items: [],
        packages: [],
      });
    }

    const sellerOrd = ordersMap.get(pkg.order_id)!;
    sellerOrd.packages.push(shipment);
    sellerOrd.subtotal += pkgSubtotal;
    sellerOrd.platformCommission += pkgCommissionTotal;
    sellerOrd.netEarnings += pkgNetEarnings;

    for (const item of shipment.items) {
      sellerOrd.totalItems += item.quantity;
      const existing = sellerOrd.items.find(
        (i) => i.productId === item.productId,
      );
      if (existing) {
        existing.quantity += item.quantity;
        existing.subtotal += item.subtotal;
      } else {
        sellerOrd.items.push({ ...item });
      }
    }
  }

  const consolidatedOrders: SellerOrder[] = Array.from(ordersMap.values()).map(
    (ord) => {
      ord.packages.sort((a, b) => a.packageNumber - b.packageNumber);
      const anyShipped = ord.packages.some(
        (p) =>
          p.status === "shipped" ||
          p.status === "delivered" ||
          p.status === "completed",
      );
      const allDelivered = ord.packages.every(
        (p) => p.status === "delivered" || p.status === "completed",
      );
      const allCancelled = ord.packages.every((p) => p.status === "cancelled");

      if (allCancelled) {
        ord.status = "cancelled";
      } else if (allDelivered) {
        ord.status = "delivered";
      } else if (anyShipped) {
        ord.status = "shipped";
      } else {
        ord.status = "pending";
      }

      return ord;
    },
  );

  return {
    orders: consolidatedOrders,
    commission: {
      baseRate: commissionConfig.base_rate,
      fixedFee: commissionConfig.fixed_fee,
      threshold: commissionConfig.threshold_amount,
    },
  };
}

/**
 * Actualiza la información de tracking y envío de una guía individual.
 */
export async function updateSellerShipment(
  packageId: string,
  companyId: string,
  payload: UpdateShipmentPayload,
) {
  const pkg = await prisma.orderPackage.findFirst({
    where: { id: packageId, company_id: companyId },
  });

  if (!pkg) {
    throw new Error(
      "Guía de despacho no encontrada o no pertenece a tu empresa",
    );
  }

  if (pkg.status === "delivered" || pkg.status === "completed") {
    throw new Error(
      "No se puede editar una guía de despacho que ya ha sido entregada",
    );
  }

  if (!payload.courier || !String(payload.courier).trim()) {
    throw new Error("La empresa de transporte es requerida");
  }
  if (!payload.trackingNumber || !String(payload.trackingNumber).trim()) {
    throw new Error("El número de tracking / guía es requerido");
  }
  if (!payload.estimatedDelivery) {
    throw new Error("La fecha estimada de entrega es requerida");
  }

  const estDeliveryDate = new Date(payload.estimatedDelivery);

  const updatedPkg = await prisma.orderPackage.update({
    where: { id: packageId },
    data: {
      courier: String(payload.courier).trim(),
      tracking_number: String(payload.trackingNumber).trim(),
      tracking_url: payload.trackingUrl
        ? String(payload.trackingUrl).trim()
        : null,
      carrier_phone: payload.carrierPhone
        ? String(payload.carrierPhone).trim()
        : null,
      estimated_delivery: estDeliveryDate,
      status: "shipped",
      updated_at: new Date(),
    },
  });

  await prisma.orderItem.updateMany({
    where: { package_id: packageId },
    data: {
      tracking_number: String(payload.trackingNumber).trim(),
      status: "shipped",
      updated_at: new Date(),
    },
  });

  await prisma.order.update({
    where: { id: pkg.order_id },
    data: { status: "shipped", updated_at: new Date() },
  });

  return updatedPkg;
}

/**
 * Re-secuencia todos los paquetes de una orden para garantizar unicidad global,
 * orden cronológico estricto y total exacto de bultos (1..N).
 */
export async function resequenceOrderPackages(
  orderId: string,
  txClient: Prisma.TransactionClient | typeof prisma = prisma,
) {
  const allOrderPackages = await txClient.orderPackage.findMany({
    where: { order_id: orderId },
    orderBy: [{ created_at: "asc" }, { id: "asc" }],
  });

  const total = allOrderPackages.length;
  for (let idx = 0; idx < allOrderPackages.length; idx++) {
    const p = allOrderPackages[idx];
    const newPkgNum = idx + 1;
    if (p.package_number !== newPkgNum || p.total_packages !== total) {
      await txClient.orderPackage.update({
        where: { id: p.id },
        data: {
          package_number: newPkgNum,
          total_packages: total,
        },
      });
    }
  }
}

/**
 * Despacha uno o múltiples bultos de una orden.
 */
export async function markSellerOrdersShipped(
  packageId: string,
  companyId: string,
  payload: MarkShippedPayload,
) {
  const pkg = await prisma.orderPackage.findFirst({
    where: { id: packageId, company_id: companyId },
    include: {
      order: {
        select: { id: true, order_code: true, buyer_id: true },
      },
    },
  });

  if (!pkg) {
    throw new Error("Paquete no encontrado o no pertenece a la empresa");
  }

  const shipments = payload.shipments;

  if (shipments && Array.isArray(shipments) && shipments.length >= 1) {
    const allCompanyPackages = await prisma.orderPackage.findMany({
      where: {
        order_id: pkg.order_id,
        company_id: pkg.company_id,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { package_number: "asc" },
    });

    const existingItems = allCompanyPackages.flatMap((p) => p.items);
    const primaryPkgId = allCompanyPackages[0]?.id || packageId;
    const otherPkgIds = allCompanyPackages
      .filter((p) => p.id !== primaryPkgId)
      .map((p) => p.id);

    const totalPackages = shipments.length;
    const orderCode = pkg.order?.order_code || `#${pkg.order_id.slice(0, 8)}`;
    const trackingNumber1 =
      shipments[0].trackingNumber?.trim() || formatTrackingId(orderCode, 1);

    await prisma.$transaction(async (tx) => {
      if (otherPkgIds.length > 0) {
        await tx.orderItem.deleteMany({
          where: { package_id: { in: otherPkgIds } },
        });
        await tx.orderPackage.deleteMany({
          where: { id: { in: otherPkgIds } },
        });
      }

      const s1 = shipments[0];
      const estDate1 = new Date(s1.estimatedDelivery);

      let s1Subtotal = 0;
      let s1Commission = 0;

      await tx.orderItem.deleteMany({
        where: { package_id: primaryPkgId },
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
            pkg.commission_rate !== null && pkg.commission_rate !== undefined
              ? Number(pkg.commission_rate)
              : 0.1;
          const itemCom = itemSub * commissionRate;

          s1Subtotal += itemSub;
          s1Commission += itemCom;

          await tx.orderItem.create({
            data: {
              package_id: primaryPkgId,
              product_id: orig.product_id,
              quantity: qty,
              unit_price: uPrice,
              subtotal: itemSub,
              commission: itemCom,
              status: "shipped",
              tracking_number: trackingNumber1,
            },
          });
        }
      }

      const s1Net = Math.max(0, s1Subtotal - s1Commission);

      await tx.orderPackage.update({
        where: { id: primaryPkgId },
        data: {
          package_number: 1,
          total_packages: totalPackages,
          status: "shipped",
          courier: s1.courier,
          tracking_number: trackingNumber1,
          tracking_url: s1.trackingUrl || null,
          carrier_phone: s1.carrierPhone || null,
          estimated_delivery: estDate1,
          subtotal: s1Subtotal,
          commission_total: s1Commission,
          net_earnings: s1Net,
          updated_at: new Date(),
        },
      });

      for (let i = 1; i < shipments.length; i++) {
        const si = shipments[i];
        const estDateI = new Date(si.estimatedDelivery);
        const trackingNumberI =
          si.trackingNumber?.trim() || formatTrackingId(orderCode, i + 1);

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
            tracking_number: trackingNumberI,
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
              pkg.commission_rate !== null && pkg.commission_rate !== undefined
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
                tracking_number: trackingNumberI,
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

      await resequenceOrderPackages(pkg.order_id, tx);

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
      primaryPkgId,
      shipments[0].courier,
      trackingNumber1,
      shipments[0].trackingUrl || null,
      new Date(shipments[0].estimatedDelivery),
    ).catch((err) =>
      console.error(
        "[Seller Orders Service] Error enviando email de despacho:",
        err,
      ),
    );

    return { totalPackages };
  }

  // Despacho de bulto único
  const carrierName = payload.carrierName ? String(payload.carrierName).trim() : "";
  const trackingNumber = payload.trackingNumber ? String(payload.trackingNumber).trim() : "";

  if (!carrierName) {
    throw new Error("La empresa de transporte es requerida");
  }
  if (!trackingNumber) {
    throw new Error("El Código de Tracking / Guía es requerido");
  }
  if (!payload.estimatedDelivery) {
    throw new Error("La Fecha Estimada de Entrega es requerida");
  }

  const estDeliveryDate = new Date(payload.estimatedDelivery);

  await prisma.$transaction(async (tx) => {
    await tx.orderPackage.update({
      where: { id: packageId },
      data: {
        status: "shipped",
        courier: carrierName,
        tracking_number: trackingNumber,
        tracking_url: payload.trackingUrl?.trim() || null,
        carrier_phone: payload.carrierPhone?.trim() || null,
        estimated_delivery: estDeliveryDate,
        updated_at: new Date(),
      },
    });

    await tx.orderItem.updateMany({
      where: { package_id: packageId },
      data: { status: "shipped", updated_at: new Date() },
    });

    await resequenceOrderPackages(pkg.order_id, tx);

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
    carrierName,
    trackingNumber,
    payload.trackingUrl?.trim() || null,
    estDeliveryDate,
  ).catch((err) =>
    console.error(
      "[Seller Orders Service] Error enviando email de despacho:",
      err,
    ),
  );

  return { totalPackages: 1 };
}

/**
 * Cancela un paquete de venta, restaurando inventario y creando solicitud de reembolso.
 */
export async function cancelSellerPackage(
  packageId: string,
  companyId: string,
) {
  const pkg = await prisma.orderPackage.findFirst({
    where: { id: packageId, company_id: companyId },
    include: {
      order: { select: { id: true, buyer_id: true } },
    },
  });

  if (!pkg) {
    throw new Error("Paquete no encontrado o no pertenece a la empresa");
  }

  if (
    pkg.status === "shipped" ||
    pkg.status === "delivered" ||
    pkg.status === "completed"
  ) {
    throw new Error(
      "No se puede cancelar un paquete que ya ha sido despachado o entregado",
    );
  }

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
  });

  for (const item of pkgItems) {
    if (item.product_id && item.quantity > 0) {
      await prisma.product.update({
        where: { id: item.product_id },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

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

    const remainingActive = await prisma.orderPackage.count({
      where: {
        order_id: pkg.order.id,
        status: { not: "cancelled" },
      },
    });
    if (remainingActive === 0) {
      await prisma.order.update({
        where: { id: pkg.order.id },
        data: { status: "cancelled", updated_at: new Date() },
      });
    }
  }

  return { success: true };
}

/**
 * Actualiza el estado de un paquete de venta.
 */
export async function updateSellerPackageStatus(
  packageId: string,
  companyId: string,
  status: string,
) {
  const pkg = await prisma.orderPackage.findFirst({
    where: { id: packageId, company_id: companyId },
  });

  if (!pkg) {
    throw new Error("Paquete no encontrado o no pertenece a la empresa");
  }

  const updatedPkg = await prisma.orderPackage.update({
    where: { id: packageId },
    data: { status, updated_at: new Date() },
  });

  await prisma.orderItem.updateMany({
    where: { package_id: packageId },
    data: { status, updated_at: new Date() },
  });

  if (status === "delivered" || status === "completed") {
    const remainingNonDelivered = await prisma.orderPackage.count({
      where: {
        order_id: pkg.order_id,
        status: { notIn: ["delivered", "completed"] },
      },
    });

    if (remainingNonDelivered === 0) {
      await prisma.order.update({
        where: { id: pkg.order_id },
        data: {
          status: "delivered",
          delivered_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  return updatedPkg;
}
