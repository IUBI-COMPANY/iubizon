import { prisma } from "@/lib/prisma";
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
    console.error("[EmailQueue] Error al encolar email:", err);
  }
}

export async function processPendingEmails(
  limit = 10,
): Promise<{ processed: number; failed: number }> {
  const resend = getResendClient();
  const fromEmail = getDefaultFromEmail();
  if (!resend || !fromEmail) return { processed: 0, failed: 0 };

  const pending = await prisma.emailQueue.findMany({
    where: { status: "pending" },
    orderBy: { created_at: "asc" },
    take: limit,
  });

  let processed = 0;
  let failed = 0;

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
            data: { status: "sent" },
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
        }
      } else {
        await prisma.emailQueue.update({
          where: { id: email.id },
          data: { status: "sent" },
        });
        processed++;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      await prisma.emailQueue
        .update({
          where: { id: email.id },
          data: {
            status:
              email.attempts + 1 >= email.max_attempts ? "failed" : "pending",
            last_error: msg,
          },
        })
        .catch(() => {});
      failed++;
    }
  }

  return { processed, failed };
}
