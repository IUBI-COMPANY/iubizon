import type { AdminNiubizConfig } from "./types";

/** Obtiene un token de seguridad fresco de Niubiz usando Basic Auth. */
export async function getNiubizSecurityToken(
  config: AdminNiubizConfig,
): Promise<string> {
  const authString = Buffer.from(`${config.user}:${config.password}`).toString(
    "base64",
  );

  const res = await fetch(config.securityUrl, {
    method: "POST",
    headers: { Authorization: `Basic ${authString}` },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Error al obtener token Niubiz (${res.status}): ${errText}`,
    );
  }

  return await res.text();
}
