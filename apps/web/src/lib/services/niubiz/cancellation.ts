import { getNiubizBaseUrl, getNiubizCredentials } from "./config";
import { getNiubizSecurityToken } from "./security";
import type { RefundTransactionParams } from "./types";

/**
 * 4. Ejecuta un Reembolso o Anulación Parcial/Total a la Tarjeta.
 */
export async function refundNiubizTransaction(params: RefundTransactionParams) {
  const config = await getNiubizCredentials();
  const securityToken = await getNiubizSecurityToken();
  const baseUrl = getNiubizBaseUrl(config.environment);
  const endpoint = `${baseUrl}/api.ecommerce/v2/ecommerce/token/cancellation/${config.merchantId}`;

  const payload = {
    channel: "web",
    authorizationCode: params.authorizationCode,
    transactionId: params.transactionId,
    amount: Number(params.amount.toFixed(2)),
    currency: "PEN",
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: securityToken,
    },
    body: JSON.stringify(payload),
  });

  const resText = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch {
    throw new Error(resText || "Error al procesar el reembolso en Niubiz.");
  }

  const actionCode = String(data.dataMap?.ACTION_CODE || "").trim();
  const isApproved =
    res.ok &&
    (actionCode === "000" || actionCode === "00" || actionCode === "0");

  if (!isApproved) {
    throw new Error(
      data.dataMap?.ACTION_DESCRIPTION ||
        data.errorMessage ||
        "Error al procesar el reembolso en Niubiz.",
    );
  }

  return {
    success: true,
    cancellationCode: data.dataMap?.AUTHORIZATION_CODE,
    rawResponse: data,
  };
}
