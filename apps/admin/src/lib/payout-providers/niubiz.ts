import type { PayoutParams, PayoutProvider, PayoutResult } from "./types";

async function getNiubizPayoutConfig() {
  const { db } = await import("@iubizon/db");

  const setting = await db.platformSetting.findUnique({
    where: { key: "NIUBIZ_CONFIG" },
  });

  let environment = (process.env.NIUBIZ_ENVIRONMENT || "sandbox").trim();
  let merchantId = environment === "production" ? "651052554" : "341198210";

  if (process.env.NIUBIZ_MERCHANT_ID) {
    merchantId = process.env.NIUBIZ_MERCHANT_ID.trim();
  }

  if (
    setting?.value &&
    typeof setting.value === "object" &&
    setting.value !== null
  ) {
    const val = setting.value as Record<string, any>;
    if (val.environment) environment = String(val.environment).trim();
    if (val.merchantId) merchantId = String(val.merchantId).trim();
  }

  const user = (
    process.env.NIUBIZ_USER || "integraciones@niubiz.com.pe"
  ).trim();
  const password = (process.env.NIUBIZ_PASSWORD || "_7592UGz").trim();
  const isProd = environment === "production";

  return {
    environment,
    merchantId,
    user,
    password,
    securityBaseUrl: isProd
      ? "https://apiprod.vnforapps.com"
      : "https://apisandbox.vnforappstest.com",
    payoutBaseUrl: isProd
      ? "https://apiprod.vnforapps.com/api.visadirect/v2/p2p"
      : "https://apitestenv.vnforapps.com/api.visadirect/sandbox/p2p",
  };
}

export class NiubizPushPaymentProvider implements PayoutProvider {
  readonly name = "niubiz";

  async processPayout(params: PayoutParams): Promise<PayoutResult> {
    const config = await getNiubizPayoutConfig();

    const authString = Buffer.from(
      `${config.user}:${config.password}`,
    ).toString("base64");

    const tokenRes = await fetch(
      `${config.securityBaseUrl}/api.security/v1/security`,
      {
        method: "POST",
        headers: { Authorization: `Basic ${authString}` },
      },
    );

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "");
      throw new Error(
        `Error al obtener token Niubiz (${tokenRes.status}): ${errText}`,
      );
    }

    const tokenData = await tokenRes.text();

    const cardNumber = params.payoutCard?.cardNumber || "4509953566233704";
    const alias =
      params.payoutCard?.alias || `+51${params.bankAccount.accountNumber}`;

    const senderCard = process.env.NIUBIZ_SENDER_CARD || "4509953566233704";

    const endpoint = `${config.payoutBaseUrl}/${config.merchantId}`;
    const payload = {
      channel: "mobile",
      applicationId: "P2P",
      order: {
        purchaseNumber: String(
          Math.floor(Math.random() * 900000) + 100000,
        ).slice(0, 6),
        amount: Number(params.amount.toFixed(2)),
        currency: "PEN",
        externalTransactionId: params.externalReferenceId,
      },
      merchant: {
        name: params.recipientName.slice(0, 25),
        origin: "IUBIZON",
        receiver: "BANK",
        address: { country: "PER" },
      },
      recipient: {
        cardNumber,
        email: "pagos@iubizon.com",
        firstName:
          params.recipientName.split(" ")[0]?.slice(0, 35) || "VENDEDOR",
        lastName:
          params.recipientName.split(" ").slice(1).join(" ").slice(0, 35) ||
          "IUBIZON",
        alias,
        aliasType: params.payoutCard?.aliasType || "PHONE",
      },
      sender: {
        cardNumber: senderCard,
        email: "pagos@iubizon.com",
        expirationMonth: 12,
        expirationYear: 2030,
        firstName: "IUBIZON",
        lastName: "PAGOS",
      },
    };

    console.log("[Niubiz P2P] Request:", endpoint, JSON.stringify(payload));

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: tokenData,
      },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(resText);
    } catch {
      throw new Error(resText || "Error al procesar pago en Niubiz P2P");
    }

    console.log(
      "[Niubiz P2P] Response:",
      res.status,
      JSON.stringify({
        responseCode: data.responseCode,
        responseMessage: data.responseMessage,
        millis: data.millis,
      }),
    );

    if (!res.ok || (data.responseCode && data.responseCode !== "00")) {
      throw new Error(
        data.responseMessage ||
          data.errorMessage ||
          "Error al procesar pago en Niubiz P2P",
      );
    }

    return {
      success: true,
      transactionId: data.ecoreTransactionUUID || data.transactionUUID || null,
      rawResponse: data,
    };
  }
}
