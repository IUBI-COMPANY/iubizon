import { getNiubizConfig } from "./config";
import { getNiubizSecurityToken } from "./security";

export interface NiubizRefundResult {
  success: boolean;
  cancellationCode: string | null;
  rawResponse: any;
}

export async function processNiubizRefund(
  transactionId: string,
  ruc: string,
  amount: number,
  refundId: string,
): Promise<NiubizRefundResult> {
  const config = await getNiubizConfig();

  let tokenData: string;
  try {
    tokenData = await getNiubizSecurityToken(config);
  } catch (err: unknown) {
    const originalMsg = err instanceof Error ? err.message : String(err);
    console.error(
      "[Niubiz] Token error:",
      originalMsg,
      "env:",
      config.environment,
    );
    throw new Error(
      `No se pudo conectar a Niubiz (${config.environment}): ${originalMsg}`,
    );
  }

  try {
    const endpoint = `${config.baseUrl}/api.refund/v1/refund/${config.merchantId}/${transactionId}`;
    const payload = {
      ruc,
      comment: "Reembolso iubizon",
      externalReferenceId: refundId.slice(0, 20),
      amount: Number(amount.toFixed(2)),
    };

    console.log("[Niubiz] Refund request:", endpoint, JSON.stringify(payload));

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
      throw new Error(resText || "Error al procesar reembolso en Niubiz");
    }

    console.log(
      "[Niubiz] Refund response:",
      res.status,
      JSON.stringify({
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
        codError: data.data?.CODERROR,
      }),
    );

    if (!res.ok || data.errorCode !== 0) {
      throw new Error(
        data.errorMessage ||
          data.data?.DSCERROR ||
          "Error al procesar reembolso en Niubiz",
      );
    }

    if (data.data?.CODERROR !== "100") {
      throw new Error(
        `Niubiz: ${data.data?.DSCERROR || "Error en la devolución"}`,
      );
    }

    return {
      success: true,
      cancellationCode: data.data?.CODIGODEVOLUCION,
      rawResponse: data,
    };
  } catch (err: unknown) {
    if (!(err instanceof Error)) {
      throw new Error("Error al procesar el reembolso en Niubiz");
    }
    if (
      err.message.includes("Niubiz:") ||
      err.message.includes("Error al procesar")
    ) {
      throw err;
    }
    throw new Error(`Error al procesar el reembolso en Niubiz: ${err.message}`);
  }
}
