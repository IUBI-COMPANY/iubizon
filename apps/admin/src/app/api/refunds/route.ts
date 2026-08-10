import { NextResponse } from "next/server";
import { db } from "@iubizon/db";

const NIUBIZ_SANDBOX_MERCHANT = "341198210";
const NIUBIZ_PROD_MERCHANT = "651052554";
const NIUBIZ_SECURITY_SANDBOX = "https://apisandbox.vnforappstest.com";
const NIUBIZ_SECURITY_PROD = "https://apiprod.vnforapps.com";
const NIUBIZ_REFUND_SANDBOX = "https://apitestenv.vnforapps.com";
const NIUBIZ_REFUND_PROD = "https://apiprod.vnforapps.com";

function triggerRefundEmail(refundId: string, approved: boolean) {
  try {
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-refund-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refundId, approved }),
    }).catch(() => {});
  } catch {}
}

interface NiubizConfig {
  environment: string;
  merchantId: string;
  user: string;
  password: string;
  securityBaseUrl: string;
  refundBaseUrl: string;
}

async function getNiubizConfig(): Promise<NiubizConfig> {
  const setting = await db.platformSetting.findUnique({
    where: { key: "NIUBIZ_CONFIG" },
  });

  let environment = (process.env.NIUBIZ_ENVIRONMENT || "sandbox").trim();
  let merchantId =
    environment === "production"
      ? NIUBIZ_PROD_MERCHANT
      : NIUBIZ_SANDBOX_MERCHANT;

  if (process.env.NIUBIZ_MERCHANT_ID) {
    merchantId = process.env.NIUBIZ_MERCHANT_ID.trim();
  }

  if (
    setting?.value &&
    typeof setting.value === "object" &&
    setting.value !== null
  ) {
    const val = setting.value as Record<string, any>;
    if (val.environment) environment = String(val.environment).trim();
    if (val.merchantId) merchantId = String(val.merchantId).trim();
  }

  const isProd = environment === "production";
  return {
    environment,
    merchantId,
    user: (process.env.NIUBIZ_USER || "integraciones@niubiz.com.pe").trim(),
    password: (process.env.NIUBIZ_PASSWORD || "_7592UGz").trim(),
    securityBaseUrl: isProd ? NIUBIZ_SECURITY_PROD : NIUBIZ_SECURITY_SANDBOX,
    refundBaseUrl: isProd ? NIUBIZ_REFUND_PROD : NIUBIZ_REFUND_SANDBOX,
  };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (status) {
      const statuses = status.split(",").filter(Boolean);
      if (statuses.length === 1) {
        where.status = statuses[0];
      } else {
        where.status = { in: statuses };
      }
    }
    if (search) {
      where.OR = [
        { order: { order_code: { contains: search } } },
        { order: { buyer: { name: { contains: search } } } },
      ];
    }

    const refunds = await db.refundRequest.findMany({
      where,
      include: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true, email: true } },
            packages: {
              select: {
                company: {
                  select: {
                    name: true,
                    legal_name: true,
                    tax_id: true,
                    phone: true,
                    location: true,
                  },
                },
              },
            },
          },
        },
        items: true,
      },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const itemIds = refunds.flatMap((r) => r.items.map((i) => i.order_item_id));
    const orderItemMap = new Map<
      string,
      { title: string; image: string | null }
    >();
    if (itemIds.length > 0) {
      const orderItems = await db.orderItem.findMany({
        where: { id: { in: itemIds } },
        include: {
          product: {
            select: {
              title: true,
              images: {
                orderBy: { position: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      });
      for (const oi of orderItems) {
        orderItemMap.set(oi.id, {
          title: oi.product.title,
          image: oi.product.images[0]?.url || null,
        });
      }
    }

    const mapped = refunds.map((r) => ({
      id: r.id,
      order_code: r.order.order_code,
      buyer_name: r.order.buyer?.name || "N/A",
      buyer_email: r.order.buyer?.email || null,
      type: r.type,
      status: r.status,
      reason: r.reason,
      refund_amount: Number(r.refund_amount),
      return_shipping_cost: r.return_shipping_cost
        ? Number(r.return_shipping_cost)
        : null,
      return_shipping_paid_by: r.return_shipping_paid_by,
      return_address: r.return_address,
      buyer_return_tracking: r.buyer_return_tracking,
      return_courier: r.return_courier,
      return_carrier_phone: r.return_carrier_phone,
      return_estimated_delivery:
        r.return_estimated_delivery?.toISOString() ?? null,
      return_tracking_url: r.return_tracking_url,
      admin_notes: r.admin_notes,
      processed_at: r.processed_at?.toISOString() ?? null,
      created_at: r.created_at?.toISOString() ?? new Date().toISOString(),
      company_name: r.order.packages[0]?.company?.name || "N/A",
      company_location: r.order.packages[0]?.company?.location || null,
      items: r.items.map((ri) => {
        const p = orderItemMap.get(ri.order_item_id);
        return {
          order_item_id: ri.order_item_id,
          product_title: p?.title || "Producto",
          product_image: p?.image || null,
          quantity: ri.quantity,
          unit_price: Number(ri.unit_price),
          subtotal: Number(ri.subtotal),
        };
      }),
    }));

    const [
      pendingCount,
      approvedCount,
      inTransitCount,
      returnedCount,
      refundedCount,
      rejectedCount,
    ] = await Promise.all([
      db.refundRequest.count({ where: { status: "pending" } }),
      db.refundRequest.count({ where: { status: "approved" } }),
      db.refundRequest.count({ where: { status: "return_in_transit" } }),
      db.refundRequest.count({ where: { status: "return_received" } }),
      db.refundRequest.count({ where: { status: "refunded" } }),
      db.refundRequest.count({ where: { status: "rejected" } }),
    ]);

    return NextResponse.json({
      refunds: mapped,
      pendingCount,
      approvedCount,
      inTransitCount,
      returnedCount,
      refundedCount,
      rejectedCount,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Refunds API] GET error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action, refundId } = body;
    if (!refundId)
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });

    if (action === "approve") {
      const {
        return_address,
        return_shipping_cost,
        return_shipping_paid_by,
        admin_notes,
      } = body;
      if (!return_address?.trim())
        return NextResponse.json(
          { error: "Dirección requerida" },
          { status: 400 },
        );

      const refund = await db.refundRequest.findUnique({
        where: { id: refundId },
      });
      if (!refund)
        return NextResponse.json({ error: "No encontrada" }, { status: 404 });
      if (refund.status !== "pending")
        return NextResponse.json(
          { error: "Solo solicitudes pendientes" },
          { status: 400 },
        );

      await db.refundRequest.update({
        where: { id: refundId },
        data: {
          status: "approved",
          return_address: return_address.trim(),
          return_shipping_cost:
            return_shipping_cost != null ? Number(return_shipping_cost) : null,
          return_shipping_paid_by: return_shipping_paid_by || "buyer",
          admin_notes: admin_notes?.trim() || null,
        },
      });

      triggerRefundEmail(refundId, true);
      return NextResponse.json({ success: true });
    }

    if (action === "reject") {
      const refund = await db.refundRequest.findUnique({
        where: { id: refundId },
      });
      if (!refund)
        return NextResponse.json({ error: "No encontrada" }, { status: 404 });
      if (refund.status !== "pending")
        return NextResponse.json(
          { error: "Solo solicitudes pendientes" },
          { status: 400 },
        );

      await db.refundRequest.update({
        where: { id: refundId },
        data: {
          status: "rejected",
          admin_notes: body.admin_notes?.trim() || null,
        },
      });

      triggerRefundEmail(refundId, false);
      return NextResponse.json({ success: true });
    }

    if (action === "process_refund") {
      return await handleProcessRefund(refundId);
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    console.error("[Refunds API] PATCH error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handleProcessRefund(refundId: string) {
  const refund = await db.refundRequest.findUnique({
    where: { id: refundId },
    select: {
      id: true,
      status: true,
      type: true,
      refund_amount: true,
      order: {
        select: {
          id: true,
          payment_transaction_id: true,
          paymentTransaction: {
            select: {
              id: true,
              transaction_id: true,
              provider: true,
            },
          },
          packages: {
            take: 1,
            select: { company: { select: { tax_id: true } } },
          },
        },
      },
      items: { select: { order_item_id: true } },
    },
  });

  if (!refund)
    return NextResponse.json(
      { error: "Solicitud no encontrada" },
      { status: 404 },
    );
  if (refund.status !== "return_received")
    return NextResponse.json(
      { error: "La devolución debe estar confirmada" },
      { status: 400 },
    );

  const tx = refund.order.paymentTransaction;
  if (!tx)
    return NextResponse.json(
      { error: "No se encontró la transacción de pago" },
      { status: 400 },
    );
  if (tx.provider !== "niubiz")
    return NextResponse.json(
      { error: "Solo reembolsos Niubiz" },
      { status: 400 },
    );
  if (!tx.transaction_id) {
    return NextResponse.json(
      { error: "Faltan datos de la transacción" },
      { status: 400 },
    );
  }

  const companyRuc = refund.order.packages[0]?.company?.tax_id;
  if (!companyRuc) {
    return NextResponse.json(
      { error: "No se encontró el RUC de la empresa" },
      { status: 400 },
    );
  }

  try {
    const result = await processNiubizRefund(
      tx.transaction_id,
      companyRuc,
      Number(refund.refund_amount),
      refundId,
    );

    await db.$transaction(async (prisma) => {
      const current = await prisma.refundRequest.findUnique({
        where: { id: refundId },
        select: { status: true },
      });

      if (current?.status !== "return_received") {
        throw new Error(
          "El estado del reembolso cambió mientras se procesaba. Verifica e intenta de nuevo.",
        );
      }

      await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "refunded",
          raw_response: result.rawResponse ?? null,
        },
      });

      await prisma.refundRequest.update({
        where: { id: refundId },
        data: { status: "refunded", processed_at: new Date() },
      });

      if (refund.type === "full") {
        await prisma.order.update({
          where: { id: refund.order.id },
          data: { status: "refunded" },
        });
      }

      const refundedItemIds = refund.items.map((i) => i.order_item_id);
      const packages = await prisma.orderPackage.findMany({
        where: {
          order_id: refund.order.id,
          items: { some: { id: { in: refundedItemIds } } },
        },
        select: { id: true },
      });

      for (const pkg of packages) {
        const allItems = await prisma.orderItem.findMany({
          where: { package_id: pkg.id },
          select: { id: true },
        });
        const allRefunded = allItems.every((i) =>
          refundedItemIds.includes(i.id),
        );
        if (allRefunded) {
          await prisma.sellerPayout.updateMany({
            where: { package_id: pkg.id },
            data: { status: "refunded" },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      cancellationCode: result.cancellationCode,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error Niubiz";

    if (msg.includes("cambió mientras se procesaba")) {
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error Niubiz" },
      { status: 400 },
    );
  }
}

async function processNiubizRefund(
  transactionId: string,
  ruc: string,
  amount: number,
  refundId: string,
) {
  const config = await getNiubizConfig();

  let tokenData: string;
  try {
    const tokenRes = await fetch(
      `${config.securityBaseUrl}/api.security/v1/security`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: config.user, password: config.password }),
      },
    );
    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "");
      throw new Error(
        `Error al obtener token Niubiz (${tokenRes.status}): ${errText}`,
      );
    }
    tokenData = await tokenRes.text();
  } catch (err: unknown) {
    const originalMsg = err instanceof Error ? err.message : String(err);
    console.error(
      "[Niubiz] Token error:",
      originalMsg,
      "env:",
      config.environment,
    );
    throw new Error(
      `No se pudo conectar a Niubiz (${config.environment}): ${originalMsg}`,
    );
  }

  try {
    const endpoint = `${config.refundBaseUrl}/api.refund/v1/refund/${config.merchantId}/${transactionId}`;
    const payload = {
      ruc,
      comment: "Reembolso iubizon",
      externalReferenceId: refundId.slice(0, 20),
      amount: Number(amount.toFixed(2)),
    };

    console.log("[Niubiz] Refund request:", endpoint, JSON.stringify(payload));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: tokenData,
      },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(resText);
    } catch {
      throw new Error(resText || "Error al procesar reembolso en Niubiz");
    }

    console.log(
      "[Niubiz] Refund response:",
      res.status,
      JSON.stringify({
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        codError: data.data?.CODERROR,
      }),
    );

    if (!res.ok || data.errorCode !== 0) {
      throw new Error(
        data.errorMessage ||
          data.data?.DSCERROR ||
          "Error al procesar reembolso en Niubiz",
      );
    }

    if (data.data?.CODERROR !== "100") {
      throw new Error(
        `Niubiz: ${data.data?.DSCERROR || "Error en la devolución"}`,
      );
    }

    return {
      success: true,
      cancellationCode: data.data?.CODIGODEVOLUCION,
      rawResponse: data,
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err.message.includes("Error al procesar") ||
        err.message.includes("Niubiz:"))
    ) {
      throw err;
    }
    console.error(
      "[Niubiz] Error:",
      err instanceof Error ? err.message : "Error de red",
    );
    throw new Error("Error al procesar el reembolso en Niubiz");
  }
}
