/**
 * Servicio de Integración Oficial con la Pasarela Niubiz (Perú)
 * PCI-DSS Nivel 1 Compliant - Server-to-Server
 */

import { prisma } from "@/lib/prisma";

export interface NiubizConfig {
  merchantId: string;
  user: string;
  password: string;
  environment: "sandbox" | "production";
}

export interface CreateSessionParams {
  amount: number;
  purchaseNumber: string;
  customerEmail: string;
  customerIp?: string;
}

export interface AuthorizeTransactionParams {
  transactionToken: string;
  purchaseNumber: string;
  amount: number;
  customerEmail: string;
  customerIp?: string;
}

export interface RefundTransactionParams {
  authorizationCode: string;
  transactionId: string;
  amount: number;
  purchaseNumber: string;
}

const NIUBIZ_SANDBOX_URL = "https://apisandbox.vnforappstest.com";
const NIUBIZ_PROD_URL = "https://apiprod.vnforapps.com";

function getBaseUrl(env: string = "sandbox") {
  return env === "production" ? NIUBIZ_PROD_URL : NIUBIZ_SANDBOX_URL;
}

/**
 * Obtiene las credenciales de Niubiz de forma jerárquica:
 * 1. Desde `platform_settings` en la BD (Administrable en tiempo real por Admin).
 * 2. Fallback a Variables de Entorno (`.env.local` / `.env.production`).
 * 3. Fallback final a credenciales oficiales de Sandbox Niubiz.
 */
export async function getNiubizCredentials(): Promise<NiubizConfig> {
  let dbMerchantId: string | null = null;
  let dbEnvironment: string | null = null;

  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: "NIUBIZ_CONFIG" },
    });
    if (
      setting &&
      typeof setting.value === "object" &&
      setting.value !== null
    ) {
      const val = setting.value as Record<string, any>;
      if (val.merchantId) dbMerchantId = String(val.merchantId).trim();
      if (val.environment) dbEnvironment = String(val.environment).trim();
    }
  } catch (err) {
    // Continuar con fallback a env
  }

  const envRaw = (
    dbEnvironment ||
    process.env.NIUBIZ_ENVIRONMENT ||
    "sandbox"
  ).trim();
  const environment = envRaw === "production" ? "production" : "sandbox";

  const defaultMerchantId =
    environment === "production" ? "651052554" : "341198210";
  const merchantId = (
    dbMerchantId ||
    process.env.NIUBIZ_MERCHANT_ID ||
    defaultMerchantId
  ).trim();

  const user = (
    process.env.NIUBIZ_USER || "integraciones@niubiz.com.pe"
  ).trim();
  const password = (process.env.NIUBIZ_PASSWORD || "_7592UGz").trim();

  return {
    merchantId,
    user,
    password,
    environment,
  };
}

/**
 * 1. Solicita un Token de Seguridad Server-to-Server fresco a la API de Niubiz
 */
export async function getNiubizSecurityToken(): Promise<string> {
  const config = await getNiubizCredentials();
  const baseUrl = getBaseUrl(config.environment);
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

  const token = (await res.text()).trim();
  return token;
}

/**
 * 2. Crea una Clave de Sesión (Session Key) para el checkout cliente JS
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
  const baseUrl = getBaseUrl(config.environment);
  const endpoint = `${baseUrl}/api.ecommerce/v2/ecommerce/token/session/${config.merchantId}`;

  const payload = {
    channel: "web",
    amount: Number(params.amount.toFixed(2)),
    antifraud: {
      clientIp: params.customerIp || "127.0.0.1",
      merchantDefineData: {
        MDD4: params.customerEmail,
        MDD75: "Registrado",
        MDD77: 1,
      },
    },
  };

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

/**
 * 3. Ejecuta la Autorización Financiera Final de la Tarjeta (Server-to-Server)
 */
export async function authorizeNiubizTransaction(
  params: AuthorizeTransactionParams,
) {
  const config = await getNiubizCredentials();
  const securityToken = await getNiubizSecurityToken();
  const baseUrl = getBaseUrl(config.environment);

  // Probar endpoints v3 y v2 con fallback transparente
  const endpointV3 = `${baseUrl}/api.authorization/v3/authorization/ecommerce/${config.merchantId}`;
  const endpointV2 = `${baseUrl}/api.ecommerce/v2/ecommerce/token/authorization/${config.merchantId}`;

  const payload = {
    channel: "web",
    captureType: "manual",
    countable: true,
    order: {
      tokenId: params.transactionToken,
      purchaseNumber: Number(params.purchaseNumber),
      amount: Number(params.amount.toFixed(2)),
      currency: "PEN",
    },
  };

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
      rawResponse: { rawText: resText },
    };
  }

  const actionCode = String(responseData.dataMap?.ACTION_CODE || "").trim();
  const isApproved =
    res.ok &&
    (actionCode === "000" || actionCode === "00" || actionCode === "0");

  if (!isApproved) {
    const errorMsg =
      responseData.dataMap?.ACTION_DESCRIPTION ||
      responseData.data?.DESC ||
      responseData.errorMessage ||
      "La tarjeta fue denegada por el banco emisor.";

    return {
      success: false,
      errorCode: actionCode || "DENIED",
      errorMessage: errorMsg,
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
 * 4. Ejecuta un Reembolso o Anulación Parcial/Total a la Tarjeta
 */
export async function refundNiubizTransaction(params: RefundTransactionParams) {
  const config = await getNiubizCredentials();
  const securityToken = await getNiubizSecurityToken();
  const baseUrl = getBaseUrl(config.environment);
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
