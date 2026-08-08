/**
 * Configuración y Validación Centralizada de Variables de Entorno para Iubizon.
 * Permite la separación estricta entre Desarrollo (Dev/Staging) y Producción (Prod).
 */

export const APP_ENV = (process.env.NEXT_PUBLIC_APP_ENV ||
  process.env.NODE_ENV ||
  "development") as "development" | "staging" | "production";

export const isProduction = APP_ENV === "production";
export const isStaging = APP_ENV === "staging";
export const isDevelopment = APP_ENV === "development";

export const env = {
  APP_ENV,
  isProduction,
  isStaging,
  isDevelopment,
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  database: {
    url: process.env.DATABASE_URL || "",
    directUrl: process.env.DIRECT_URL || "",
  },
};

/**
 * Valida que las variables obligatorias existan al iniciar la aplicación.
 */
export function validateEnv() {
  const missing: string[] = [];

  if (!env.supabase.url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabase.anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!env.database.url) missing.push("DATABASE_URL");

  if (missing.length > 0) {
    const errorMsg = `❌ Error de Configuración: Faltan las siguientes variables de entorno para [${APP_ENV}]:\n  - ${missing.join(
      "\n  - ",
    )}\n\nPor favor verifica tu archivo .env.local (Desarrollo) o la configuración del servidor (Vercel / Hosting).`;
    if (isProduction) {
      throw new Error(errorMsg);
    } else {
      console.warn(errorMsg);
    }
  }
}
