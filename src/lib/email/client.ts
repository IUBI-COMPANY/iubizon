import { Resend } from "resend";

export const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
};

export const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "iubizon <onboarding@resend.dev>";
