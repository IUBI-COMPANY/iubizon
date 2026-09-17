export const CULQI_CONFIG = {
  apiUrl: process.env.CULQI_API_URL || "https://api.culqi.com/v2",
  publicKey: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "",
  secretKey: process.env.CULQI_SECRET_KEY || "",
  currency: "PEN",
};

export function getCulqiPublicKey(): string {
  return process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY || "";
}

export function getCulqiSecretKey(): string {
  const key = process.env.CULQI_SECRET_KEY;
  if (!key) {
    throw new Error(
      "CULQI_SECRET_KEY no está configurada en las variables de entorno.",
    );
  }
  return key;
}
