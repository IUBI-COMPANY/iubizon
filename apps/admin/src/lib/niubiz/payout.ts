import type {
  PayoutParams,
  PayoutProvider,
  PayoutResult,
} from "@/lib/payout-providers/types";
import { getNiubizConfig, getNiubizPayoutUrl } from "./config";
import { getNiubizSecurityToken } from "./security";

export class NiubizPushPaymentProvider implements PayoutProvider {
  readonly name = "niubiz";

  async processPayout(params: PayoutParams): Promise<PayoutResult> {
    const config = await getNiubizConfig();
    const tokenData = await getNiubizSecurityToken(config);

    const cardNumber = params.payoutCard?.cardNumber || "4509953566233704";
    const alias =
      params.payoutCard?.alias || `+51${params.bankAccount.accountNumber}`;

    const senderCard = process.env.NIUBIZ_SENDER_CARD || "4509953566233704";

    const endpoint = `${getNiubizPayoutUrl(config.environment)}/${config.merchantId}`;
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
