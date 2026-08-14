import { getNiubizBaseUrl, getNiubizCredentials } from "./config";
import { buildSessionPayload } from "./payloads";
import { getNiubizSecurityToken } from "./security";
import type { CreateSessionParams } from "./types";

/**
 * 2. Crea una Clave de Sesión (Session Key) para el checkout cliente JS.
 */
export async function createNiubizSession(
  params: CreateSessionParams,
): Promise<{
  sessionKey: string;
  merchantId: string;
  environment: string;
}> {
  const config = await getNiubizCredentials();
  const securityToken = await getNiubizSecurityToken();
  const baseUrl = getNiubizBaseUrl(config.environment);
  const endpoint = `${baseUrl}/api.ecommerce/v2/ecommerce/token/session/${config.merchantId}`;

  const payload = buildSessionPayload({
    amount: params.amount,
    customerIp: params.customerIp || "127.0.0.1",
    customer: params.customer,
    registrationCount: config.registrationCount,
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: securityToken,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Error creando sesión Niubiz (HTTP ${res.status}):`, errText);
    let errMsg = "Error al inicializar la pasarela de pago Niubiz.";
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson?.data?.DESC || errJson?.errorMessage || errText;
    } catch {}
    throw new Error(`Niubiz Session Error (HTTP ${res.status}): ${errMsg}`);
  }

  const data = await res.json();
  return {
    sessionKey: data.sessionKey,
    merchantId: config.merchantId,
    environment: config.environment,
  };
}
