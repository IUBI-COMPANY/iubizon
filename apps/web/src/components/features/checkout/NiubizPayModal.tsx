"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  PaymentWidgetProps,
  PaymentSuccessData,
} from "@/components/features/checkout/paymentWidgets";

declare global {
  interface Window {
    VisanetCheckout?: {
      configure: (config: Record<string, unknown>) => void;
      open: () => void;
    };
  }
}

function loadNiubizScript(environment: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptId = "niubiz-checkout-script";
    const existing = document.getElementById(scriptId);

    const targetUrl =
      environment === "production"
        ? "https://static-content.vnforapps.com/v2/js/checkout.js"
        : "https://static-content-qas.vnforapps.com/v2/js/checkout.js";

    if (existing) {
      if (
        existing.getAttribute("data-env") === environment &&
        window.VisanetCheckout
      ) {
        resolve();
        return;
      }
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.setAttribute("data-env", environment);
    script.src = targetUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error("No se pudo cargar el módulo de pago seguro de Niubiz."),
      );
    document.body.appendChild(script);
  });
}

export function NiubizPayModal({
  amount,
  cartItems,
  shippingForm,
  invoiceDetails,
  onValidate,
  onSuccess,
  onError,
  onLoadingChange,
}: PaymentWidgetProps) {
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(
    "Conectando de forma segura con la pasarela de pagos...",
  );

  const propsRef = useRef({
    amount,
    cartItems,
    shippingForm,
    invoiceDetails,
    onValidate,
    onSuccess,
    onError,
    onLoadingChange,
  });

  useEffect(() => {
    propsRef.current = {
      amount,
      cartItems,
      shippingForm,
      invoiceDetails,
      onValidate,
      onSuccess,
      onError,
      onLoadingChange,
    };
  });

  const updateLoading = (isLoading: boolean, msg?: string) => {
    setLoadingSession(isLoading);
    if (msg) setLoadingMsg(msg);
    propsRef.current.onLoadingChange?.(isLoading, msg);
  };

  // 1. Iniciar sesión de pago y abrir formulario modal
  const handleInitiatePayment = async () => {
    if (propsRef.current.onValidate && !propsRef.current.onValidate()) {
      return;
    }

    try {
      updateLoading(
        true,
        "Conectando de forma segura con la pasarela de pagos...",
      );

      const currentProps = propsRef.current;
      const res = await fetch("/api/payments/niubiz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: currentProps.amount,
          cartItems: currentProps.cartItems,
          shipping: currentProps.shippingForm,
          invoiceDetails: currentProps.invoiceDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo iniciar el proceso de pago.");
      }

      await loadNiubizScript(data.environment);

      if (!window.VisanetCheckout) {
        throw new Error(
          "El módulo de pago no está disponible en este momento.",
        );
      }

      window.VisanetCheckout.configure({
        sessiontoken: data.sessionKey,
        channel: "web",
        merchantid: data.merchantId,
        purchasenumber: Number(data.purchaseNumber),
        amount: Number(currentProps.amount.toFixed(2)),
        expirationminutes: "20",
        timeouturl: `${window.location.origin}/cart?error=timeout`,
        merchantlogo: `${window.location.origin}/images/principal-logo.png`,
        formbuttoncolor: "#f25c05",
        action: `${window.location.origin}/api/payments/niubiz/confirm?purchaseNumber=${data.purchaseNumber}`,
        complete: async (response: any) => {
          if (response && response.transactionToken) {
            await processAuthorization(
              response.transactionToken,
              data.purchaseNumber,
            );
          } else {
            updateLoading(false);
            propsRef.current.onError(
              "El formulario de pago fue cerrado sin completar la transacción.",
            );
          }
        },
        cancel: () => {
          updateLoading(false);
          propsRef.current.onError(
            "El formulario de pago fue cerrado sin completar la transacción.",
          );
        },
      });

      window.VisanetCheckout.open();
    } catch (err: unknown) {
      updateLoading(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Error al conectarse con la pasarela de pagos.";
      propsRef.current.onError(msg);
    }
  };

  // 2. Procesar autorización Server-to-Server
  const processAuthorization = async (
    transactionToken: string,
    purchaseNumber: string,
  ) => {
    try {
      updateLoading(true, "Procesando pago seguro y registrando tu pedido...");
      const activeProps = propsRef.current;
      const res = await fetch("/api/payments/niubiz/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionToken,
          purchaseNumber,
          amount: activeProps.amount,
          cartItems: activeProps.cartItems,
          shipping: activeProps.shippingForm,
          invoiceDetails: activeProps.invoiceDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.denied) {
          const params = new URLSearchParams({
            status: "denied",
            purchaseNumber: data.purchaseNumber || purchaseNumber,
            actionDescription:
              data.actionDescription || data.error || "Pago rechazado",
            transactionDate: data.transactionDate || new Date().toISOString(),
          });
          window.location.href = `/cart/result?${params.toString()}`;
          return;
        }
        throw new Error(
          data.error || "La tarjeta fue denegada por el banco emisor.",
        );
      }

      updateLoading(
        true,
        "¡Pago Aprobado! Redireccionando al comprobante de tu compra...",
      );
      activeProps.onSuccess({
        orderCode: data.orderCode || data.sessionCode,
        amount: data.amount ?? activeProps.amount,
        currency: data.currency || "PEN",
        cardBrand: data.cardBrand ?? null,
        cardLast4: data.cardLast4 ?? null,
        transactionDate: data.transactionDate || new Date().toISOString(),
      });
    } catch (err: unknown) {
      updateLoading(false);
      const msg =
        err instanceof Error ? err.message : "Error al confirmar el pago.";
      propsRef.current.onError(msg);
    }
  };

  return (
    <div className="w-full space-y-3">
      <Button
        onClick={handleInitiatePayment}
        disabled={loadingSession}
        className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold py-4 px-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-base tracking-wide active:scale-[0.99]"
      >
        {loadingSession ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{loadingMsg}</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pagar S/ {amount.toFixed(2)} con Tarjeta</span>
          </>
        )}
      </Button>

      <div className="w-full flex items-center justify-center gap-2 text-xs text-[#059669] bg-[#ecfdf5] py-2.5 px-4 rounded-xl border border-[#a7f3d0] text-center font-medium shadow-2xs">
        <Lock className="w-4 h-4 text-[#059669] shrink-0" />
        <span>
          Pago 100% encriptado con certificación PCI-DSS y garantía de
          protección al comprador Iubizon
        </span>
      </div>
    </div>
  );
}
