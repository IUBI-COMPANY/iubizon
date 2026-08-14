import {
  getNiubizBaseUrl,
  getNiubizCredentials,
  getNiubizCurrency,
} from "./config";
import { buildAuthorizationPayload } from "./payloads";
import { getNiubizSecurityToken } from "./security";
import type { AuthorizeTransactionParams, AuthorizationResult } from "./types";

/**
 * 3. Ejecuta la Autorización Financiera Final de la Tarjeta (Server-to-Server).
 */
export async function authorizeNiubizTransaction(
  params: AuthorizeTransactionParams,
): Promise<AuthorizationResult> {
  const config = await getNiubizCredentials();
  const securityToken = await getNiubizSecurityToken();
  const currency = params.currency || (await getNiubizCurrency());
  const baseUrl = getNiubizBaseUrl(config.environment);

  const endpointV3 = `${baseUrl}/api.authorization/v3/authorization/ecommerce/${config.merchantId}`;
  const endpointV2 = `${baseUrl}/api.ecommerce/v2/ecommerce/token/authorization/${config.merchantId}`;

  const payload = buildAuthorizationPayload({
    transactionToken: params.transactionToken,
    purchaseNumber: params.purchaseNumber,
    amount: params.amount,
    currency,
    serviceLocation: config.serviceLocation,
  });

  let res = await fetch(endpointV3, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: securityToken,
    },
    body: JSON.stringify(payload),
  });

  let resText = await res.text();

  // Si v3 falla con 404/406, probar fallback v2
  if (
    res.status === 404 ||
    res.status === 406 ||
    resText.includes("RESTEASY") ||
    resText.includes("Accept")
  ) {
    console.warn(
      `[Niubiz] Intento v3 falló (HTTP ${res.status}). Probando endpoint v2 fallback...`,
    );
    res = await fetch(endpointV2, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: securityToken,
      },
      body: JSON.stringify(payload),
    });
    resText = await res.text();
  }

  console.log(
    `[Niubiz Authorization] Status final: ${res.status}, Response:`,
    resText,
  );

  let responseData: any = {};
  try {
    responseData = JSON.parse(resText);
  } catch {
    console.error(`Respuesta no-JSON de Niubiz (HTTP ${res.status}):`, resText);
    return {
      success: false,
      errorCode: `HTTP_${res.status}`,
      errorMessage:
        "La tarjeta o transacción fue rechazada por el banco emisor.",
      actionDescription:
        "La tarjeta o transacción fue rechazada por el banco emisor.",
      rawResponse: { rawText: resText },
    };
  }

  const status = String(responseData.dataMap?.STATUS || "").trim();
  const actionCode = String(responseData.dataMap?.ACTION_CODE || "").trim();
  const isApproved =
    res.ok &&
    (status === "Authorized" || ["000", "00", "0"].includes(actionCode));

  if (!isApproved) {
    const errorMsg = extractErrorDescription(responseData, actionCode);

    return {
      success: false,
      errorCode: actionCode || "DENIED",
      errorMessage: errorMsg,
      actionDescription: errorMsg,
      rawResponse: responseData,
    };
  }

  return {
    success: true,
    transactionId: responseData.dataMap?.TRANSACTION_ID,
    authorizationCode: responseData.dataMap?.AUTHORIZATION_CODE,
    cardBrand: responseData.dataMap?.BRAND,
    cardLast4: responseData.dataMap?.CARD?.slice(-4),
    rawResponse: responseData,
  };
}

/**
 * Extrae la descripción de la denegación probando múltiples campos de la
 * respuesta de Niubiz (la estructura varía entre sandbox/producción y v2/v3).
 */
function extractErrorDescription(
  responseData: any,
  actionCode: string,
): string {
  const candidates = [
    responseData.dataMap?.ACTION_DESCRIPTION,
    responseData.dataMap?.ACTION_DESC,
    responseData.data?.DESC,
    responseData.data?.ACTION_DESCRIPTION,
    responseData.errorMessage,
  ];

  const found = candidates.find(
    (c) => typeof c === "string" && c.trim().length > 0,
  );
  if (found) return found.trim();

  return actionCode
    ? `La tarjeta fue denegada por el banco emisor (código ${actionCode}).`
    : "La tarjeta fue denegada por el banco emisor.";
}
