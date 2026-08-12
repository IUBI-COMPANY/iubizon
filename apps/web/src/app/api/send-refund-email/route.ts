import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDefaultFromEmail, getResendClient } from "@iubizon/email";
import { sendRefundStatusNotification } from "@/lib/email";
import { sendRefundCompletedNotification } from "@/lib/email";

export async function POST(req: Request) {
  const { refundId, approved, type } = await req.json();
  if (!refundId)
    return NextResponse.json({ error: "refundId requerido" }, { status: 400 });

  if (type === "completed") {
    sendRefundCompletedNotification(refundId).catch((err) =>
      console.error("[Refund Notification] Error:", err),
    );
  } else if (type === "approved_seller") {
    notifySellerOnApproval(refundId);
  } else {
    sendRefundStatusNotification(refundId, approved ?? true).catch((err) =>
      console.error("[Refund Notification] Error:", err),
    );
  }

  return NextResponse.json({ success: true });
}

async function notifySellerOnApproval(refundId: string) {
  try {
    const refund = await prisma.refundRequest.findUnique({
      where: { id: refundId },
      select: {
        order: {
          select: {
            order_code: true,
            buyer: { select: { name: true } },
            packages: {
              take: 1,
              select: { company: { select: { name: true, email: true } } },
            },
          },
        },
        type: true,
        refund_amount: true,
        reason: true,
      },
    });

    const company = refund?.order?.packages?.[0]?.company;
    if (!company?.email || !refund) return;

    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();
    if (!resend || !fromEmail) return;

    const orderCode = refund.order.order_code;
    const buyerName = refund.order.buyer?.name || "Comprador";

    await resend.emails.send({
      from: fromEmail,
      to: [company.email],
      subject: `Reembolso Aprobado — Orden #${orderCode} — iubizon`,
      html: `
        <div style="font-family:Arial,sans-serif;color:#334155;font-size:14px;max-width:500px">
          <h2 style="color:#112237;margin:0 0 12px">Reembolso Aprobado</h2>
          <p>El comprador <strong>${buyerName}</strong> solicitó un reembolso para la orden <strong>#${orderCode}</strong> y ha sido aprobado.</p>
          <p>El comprador enviará el producto de vuelta. Cuando registre el envío, recibirás los datos de seguimiento.</p>
          <table style="background:#f8fafc;border-radius:8px;padding:12px;width:100%;margin:16px 0">
            <tr><td style="color:#64748b">Monto</td><td style="font-weight:700;text-align:right">S/ ${Number(refund.refund_amount).toFixed(2)}</td></tr>
            <tr><td style="color:#64748b">Tipo</td><td style="font-weight:700;text-align:right">${refund.type === "full" ? "Reembolso Total" : "Reembolso Parcial"}</td></tr>
            <tr><td style="color:#64748b">Motivo</td><td style="text-align:right">${refund.reason}</td></tr>
          </table>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com"}/user/dashboard/orders" style="background:#f25c05;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Ir a Gestión de Ventas</a>
        </div>
      `,
    });
  } catch (err) {
    console.error("[NotifySeller] Error:", err);
  }
}
