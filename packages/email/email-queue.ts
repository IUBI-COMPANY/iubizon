import { db as prisma } from "@iubizon/db";
import { getDefaultFromEmail, getResendClient } from "./client";
import { renderEmail } from "./email-renderer";

export async function enqueueEmail(
  to: string | string[],
  subject: string,
  template: string,
  data: Record<string, any>,
  cc?: string[],
) {
  try {
    await prisma.emailQueue.create({
      data: {
        to_email: Array.isArray(to) ? to[0] : to,
        subject,
        template,
        data,
        cc: cc || [],
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(
      `[EmailQueue] Error al encolar email (template="${template}", to="${Array.isArray(to) ? to[0] : to}"):`,
      msg,
    );
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

      const react = renderEmail(email.template, email.data);
      if (!react) {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: {
            status: "failed",
            last_error: `Template not found: ${email.template}`,
          },
        });
        failed++;
        continue;
      }

      const { error } = await resend.emails.send({
        from: fromEmail,
        to: [email.to_email],
        ...(email.cc.length > 0 ? { cc: email.cc } : {}),
        subject: email.subject,
        react,
      });

      if (error) {
        if (
          error.message?.includes("testing emails to your own email address")
        ) {
          const fallback =
            error.message.match(/\(([^)]+)\)/)?.[1] ||
            "iubizon.company@gmail.com";
          await resend.emails.send({
            from: fromEmail,
            to: [fallback],
            subject: `[PRUEBA] ${email.subject}`,
            react,
          });
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: "sent", last_error: null },
          });
          processed++;
        } else if (email.attempts + 1 >= email.max_attempts) {
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: "failed", last_error: error.message },
          });
          failed++;
        } else {
          await prisma.emailQueue.update({
            where: { id: email.id },
            data: { status: "pending", last_error: error.message },
          });
          requeued++;
        }
      } else {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "sent", last_error: null },
        });
        processed++;
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
