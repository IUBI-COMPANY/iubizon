import React from "react";
import { getDefaultFromEmail, getResendClient } from "./client";

export async function sendResendEmail(
  to: string | string[],
  subject: string,
  react: React.ReactElement,
  cc?: string[],
) {
  const resend = getResendClient();
  const fromEmail = getDefaultFromEmail();
  if (!resend || !fromEmail) return;

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: Array.isArray(to) ? to : [to],
    ...(cc && cc.length > 0 ? { cc } : {}),
    subject,
    react,
  });

  if (error) {
    console.error(`[Email] Error enviando a ${Array.isArray(to) ? to.join(", ") : to}:`, error);

    if (error.message?.includes("testing emails to your own email address")) {
      const fallbackEmail =
        error.message.match(/\(([^)]+)\)/)?.[1] || "iubizon.company@gmail.com";
      await resend.emails.send({
        from: fromEmail,
        to: [fallbackEmail],
        subject: `[PRUEBA] ${subject}`,
        react,
      });
    }
    return;
  }

  console.log(`[Email] Enviado a ${Array.isArray(to) ? to.join(", ") : to} (ID: ${data?.id})`);
}
