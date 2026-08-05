import { Resend } from "resend";

export const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

export const getDefaultFromEmail = (): string => {
  return process.env.EMAIL_FROM || "iubizon <notificaciones@iubizon.com>";
};

export const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "iubizon <notificaciones@iubizon.com>";
