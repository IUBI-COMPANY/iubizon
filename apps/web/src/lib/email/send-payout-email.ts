import { prisma } from "@/lib/prisma";
import { getDefaultFromEmail, getResendClient } from "./client";

export async function sendSellerPayoutNotification(payoutId: string) {
  try {
    const payout = await prisma.sellerPayout.findUnique({
      where: { id: payoutId },
      include: {
        company: {
          select: {
            name: true,
            email: true,
          },
        },
        package: {
          select: {
            tracking_number: true,
            order: { select: { order_code: true } },
          },
        },
      },
    });

    if (!payout || !payout.company?.email) {
      console.warn(
        `[Payout Notification] Payout #${payoutId} no tiene email de empresa asociado.`,
      );
      return;
    }

    const resend = getResendClient();
    const fromEmail = getDefaultFromEmail();

    if (!resend || !fromEmail) {
      console.warn(
        "[Payout Notification] Resend no está configurado (Falta RESEND_API_KEY).",
      );
      return;
    }

    const netAmount = Number(payout.net_amount || 0).toFixed(2);
    const companyName = payout.company.name || "Empresa Vendedora";
    const paymentMethodLabel =
      payout.payment_method === "niubiz"
        ? "Transferencia Inmediata Niubiz (Visa Direct P2P)"
        : payout.payment_method === "bank_transfer" ||
            payout.payment_method === "manual"
          ? "Depósito / Transferencia Bancaria"
          : payout.payment_method || "Abono iubizon";

    const refCode = payout.reference_code || "N/A";
    const orderCode = payout.package?.order?.order_code || "Venta";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://iubizon.com";

    await resend.emails.send({
      from: fromEmail,
      to: [payout.company.email],
      subject: `¡Abono Transferido Exitosamente! — S/ ${netAmount} — iubizon`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #112237; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Abono Confirmado</span>
            <h1 style="color: #112237; font-size: 24px; font-weight: 900; margin: 12px 0 4px 0;">¡Transferencia Realizada!</h1>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Hemos procesado la retribución de tus ventas en iubizon</p>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Monto Neto Transferido</span>
            <div style="color: #059669; font-size: 32px; font-weight: 900; margin-top: 4px;">S/ ${netAmount}</div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Empresa Receptora:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #112237;">${companyName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Método de Pago:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #112237;">${paymentMethodLabel}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">N° de Operación / Ref:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #f25c05;">${refCode}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748b; font-weight: 600;">Orden Referencia:</td>
              <td style="padding: 10px 0; font-weight: 700; text-align: right; color: #112237;">#${orderCode}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 24px;">
            <a href="${appUrl}/user/dashboard/payouts" style="background-color: #f25c05; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; font-size: 14px; display: inline-block;">Ver Historial de Finanzas</a>
          </div>

          <div style="border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 11px;">
            Este es un correo automático emitido por la plataforma iubizon.<br/>
            © ${new Date().getFullYear()} iubizon. Todos los derechos reservados.
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("[Payout Notification] Error inesperado:", err);
  }
}
