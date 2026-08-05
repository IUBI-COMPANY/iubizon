import { Resend } from "resend";

let cachedResend: { key: string; client: Resend } | null = null;

export const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (cachedResend && cachedResend.key === apiKey) {
    return cachedResend.client;
  }
  const client = new Resend(apiKey);
  cachedResend = { key: apiKey, client };
  return client;
};

export const getDefaultFromEmail = (): string => {
  return process.env.EMAIL_FROM || "iubizon <notificaciones@iubizon.com>";
};

export const DEFAULT_FROM_EMAIL = getDefaultFromEmail();
