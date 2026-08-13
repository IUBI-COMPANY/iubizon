import { db as prisma } from "@iubizon/db";
import { getDefaultFromEmail, getResendClient } from "./client";
import { renderEmail } from "./email-renderer";

interface DeliverPayload {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  cc: string[];
}

/**
 * Renderiza y envía un email vía Resend.
 * Devuelve null si se envió correctamente, o el mensaje de error.
 */
async function deliverEmail(
  payload: DeliverPayload,
  resend: NonNullable<ReturnType<typeof getResendClient>>,
  fromEmail: string,
): Promise<string | null> {
  const react = renderEmail(payload.template, payload.data);
  if (!react) {
    return `Template not found: ${payload.template}`;
  }

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [payload.to],
    ...(payload.cc.length > 0 ? { cc: payload.cc } : {}),
    subject: payload.subject,
    react,
  });

  if (!error) return null;

  if (error.message?.includes("testing emails to your own email address")) {
    const fallback =
      error.message.match(/\(([^)]+)\)/)?.[1] || "iubizon.company@gmail.com";
    const fallbackSend = await resend.emails.send({
      from: fromEmail,
      to: [fallback],
      subject: `[PRUEBA] ${payload.subject}`,
      react,
    });
    return fallbackSend.error ? fallbackSend.error.message : null;
  }

  return error.message;
}

/**
 * Encola el email (observabilidad + reintento) y lo envía de inmediato.
 * Si el envío falla, queda en "pending" para que el cron lo reintente.
 */
export async function enqueueEmail(
  to: string | string[],
  subject: string,
  template: string,
  data: Record<string, any>,
  cc?: string[],
) {
  const payload: DeliverPayload = {
    to: Array.isArray(to) ? to[0] : to,
    subject,
    template,
    data,
    cc: cc || [],
  };

  let entryId: string | null = null;

  try {
    const entry = await prisma.emailQueue.create({
      data: {
        to_email: payload.to,
        subject,
        template,
        data,
        cc: payload.cc,
      },
    });
    entryId = entry.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[EmailQueue] Error al encolar email (template="${template}", to="${payload.to}"):`,
      msg,
    );
    return;
  }

  const resend = getResendClient();
  const fromEmail = getDefaultFromEmail();
  if (!resend || !fromEmail) {
    console.warn(
      "[EmailQueue] Resend no configurado; el email queda en cola para el cron.",
    );
    return;
  }

  try {
    const errorMsg = await deliverEmail(payload, resend, fromEmail);

    if (errorMsg === null) {
      await prisma.emailQueue.update({
        where: { id: entryId },
        data: { status: "sent", attempts: 1, last_error: null },
      });
    } else {
      await prisma.emailQueue.update({
        where: { id: entryId },
        data: { status: "pending", attempts: 1, last_error: errorMsg },
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await prisma.emailQueue
      .update({
        where: { id: entryId },
        data: { status: "pending", attempts: 1, last_error: msg },
      })
      .catch(() => {});
  }
}

export interface ProcessPendingEmailsResult {
  processed: number;
  failed: number;
  requeued: number;
}

export async function processPendingEmails(
  limit = 10,
): Promise<ProcessPendingEmailsResult> {
  const resend = getResendClient();
  const fromEmail = getDefaultFromEmail();
  if (!resend || !fromEmail) {
    console.warn(
      "[EmailQueue] Resend no configurado (falta RESEND_API_KEY o EMAIL_FROM).",
    );
    return { processed: 0, failed: 0, requeued: 0 };
  }

  const apiKey = process.env.RESEND_API_KEY || "";
  console.log(
    `[EmailQueue] Procesando cola con key ${apiKey.slice(0, 6)}*** (from: ${fromEmail})`,
  );

  const pending = await prisma.emailQueue.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "asc" },
    take: limit,
  });

  let processed = 0;
  let failed = 0;
  let requeued = 0;

  for (const email of pending) {
    try {
      await prisma.emailQueue.update({
        where: { id: email.id },
        data: { status: "sending", attempts: email.attempts + 1 },
      });

      const errorMsg = await deliverEmail(
        {
          to: email.to_email,
          subject: email.subject,
          template: email.template,
          data: email.data as Record<string, any>,
          cc: email.cc,
        },
        resend,
        fromEmail,
      );

      if (errorMsg === null) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "sent", last_error: null },
        });
        processed++;
      } else if (email.attempts + 1 >= email.max_attempts) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "failed", last_error: errorMsg },
        });
        failed++;
      } else {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "pending", last_error: errorMsg },
        });
        requeued++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const terminal = email.attempts + 1 >= email.max_attempts;
      await prisma.emailQueue
        .update({
          where: { id: email.id },
          data: {
            status: terminal ? "failed" : "pending",
            last_error: msg,
          },
        })
        .catch(() => {});
      if (terminal) {
        failed++;
      } else {
        requeued++;
      }
    }
  }

  console.log(
    `[EmailQueue] Resultado: ${processed} enviados, ${failed} fallidos, ${requeued} reencolados.`,
  );
  return { processed, failed, requeued };
}
