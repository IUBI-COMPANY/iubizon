import { getNiubizBaseUrl, getNiubizCredentials } from "./config";

/**
 * 1. Solicita un Token de Seguridad Server-to-Server fresco a la API de Niubiz.
 */
export async function getNiubizSecurityToken(): Promise<string> {
  const config = await getNiubizCredentials();
  const baseUrl = getNiubizBaseUrl(config.environment);
  const endpoint = `${baseUrl}/api.security/v1/security`;

  const authString = Buffer.from(`${config.user}:${config.password}`).toString(
    "base64",
  );

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authString}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(
      `Error al obtener token de seguridad Niubiz (HTTP ${res.status}):`,
      errorText,
    );
    throw new Error(
      `Error de autenticación Niubiz (HTTP ${res.status}): ${errorText || "Credenciales inválidas"}`,
    );
  }

  return (await res.text()).trim();
}
