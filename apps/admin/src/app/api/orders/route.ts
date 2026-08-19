import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const deliveryType = searchParams.get("deliveryType") || "";
  const search = (searchParams.get("search") || "").trim();

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (deliveryType) {
    where.packages = {
      some: {
        delivery_type: deliveryType,
      },
    };
  }
  if (search) {
    where.OR = [
      { order_code: { contains: search, mode: "insensitive" } },
      { buyer: { name: { contains: search, mode: "insensitive" } } },
      { buyer: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: {
        buyer: { select: { name: true, email: true, phone: true } },
        shipping: true,
        invoice: true,
        packages: {
          include: {
            company: { select: { name: true } },
            items: { include: { product: { select: { title: true } } } },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      id,
      packageId,
      status,
      courier,
      trackingNumber,
      trackingUrl,
      carrierPhone,
      estimatedDelivery,
    } = body;

    // Acción 1: Actualizar datos de despacho del paquete (iubizon -> cliente final o vendedor -> iubizon)
    if (action === "updatePackageDispatch" && packageId) {
      const updatedPkg = await db.orderPackage.update({
        where: { id: packageId },
        data: {
          courier: courier || null,
          tracking_number: trackingNumber || null,
          tracking_url: trackingUrl || null,
          carrier_phone: carrierPhone || null,
          estimated_delivery: estimatedDelivery
            ? new Date(estimatedDelivery)
            : null,
          ...(status ? { status } : {}),
        },
      });

      // Si el estado del paquete cambia a "shipped" o "delivered", sincronizar el estado global de la orden si corresponde
      if (status === "shipped" || status === "delivered") {
        const pkgOrder = await db.orderPackage.findUnique({
          where: { id: packageId },
          select: { order_id: true },
        });
        if (pkgOrder?.order_id) {
          const allPackages = await db.orderPackage.findMany({
            where: { order_id: pkgOrder.order_id },
            select: { status: true },
          });
          const allShippedOrDelivered = allPackages.every(
            (p) =>
              p.status === "shipped" ||
              p.status === "delivered" ||
              p.status === "completed",
          );
          if (allShippedOrDelivered) {
            await db.order.update({
              where: { id: pkgOrder.order_id },
              data: { status: status },
            });
          }
        }
      }

      return NextResponse.json({ success: true, package: updatedPkg });
    }

    // Acción 2: Marcar recepción de paquete en Almacén Central iubizon
    if (action === "markPackageReceived" && packageId) {
      const updatedPkg = await db.orderPackage.update({
        where: { id: packageId },
        data: {
          status: "received_in_warehouse",
        },
      });
      return NextResponse.json({ success: true, package: updatedPkg });
    }

    // Acción 3: Cambio manual de estado de la orden (soporte)
    if (id && status) {
      await db.order.update({ where: { id }, data: { status } });

      // También actualizar el estado de sus paquetes
      await db.orderPackage.updateMany({
        where: { order_id: id },
        data: { status },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Parámetros insuficientes." },
      { status: 400 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Error al actualizar la orden.",
      },
      { status: 500 },
    );
  }
}
