"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type {
  PaymentWidgetProps,
  PaymentSuccessData,
} from "@/components/features/checkout/paymentWidgets";

declare global {
  interface Window {
    Culqi?: {
      publicKey: string;
      settings: (config: Record<string, unknown>) => void;
      options: (config: Record<string, unknown>) => void;
      open: () => void;
      close: () => void;
      token?: {
        id: string;
        email: string;
        [key: string]: unknown;
      };
      order?: {
        id: string;
        [key: string]: unknown;
      };
      error?: {
        user_message?: string;
        merchant_message?: string;
        [key: string]: unknown;
      };
    };
    culqi?: () => void;
  }
}

function loadCulqiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const scriptId = "culqi-checkout-v4-script";
    const existing = document.getElementById(scriptId);

    if (existing && window.Culqi) {
      resolve();
      return;
    }

    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.culqi.com/js/v4";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el módulo de pago seguro de Culqi."));
    document.body.appendChild(script);
  });
}

export function CulqiPayModal({
  amount,
  cartItems,
  shippingForm,
  invoiceDetails,
  onValidate,
  onSuccess,
  onError,
  onLoadingChange,
}: PaymentWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(
    "Conectando de forma segura con la pasarela de pagos...",
  );

  // Mantener referencias actualizadas de las props para evitar recrear callbacks o desincronizar closures
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
    setLoading(isLoading);
    if (msg) setLoadingMsg(msg);
    propsRef.current.onLoadingChange?.(isLoading, msg);
  };

  // Limpieza ÚNICAMENTE al desmontar el componente (para que los re-renders no borren window.culqi)
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.culqi) {
        delete window.culqi;
      }
    };
  }, []);

  const handleInitiatePayment = async () => {
    if (propsRef.current.onValidate && !propsRef.current.onValidate()) {
      return;
    }

    try {
      updateLoading(
        true,
        "Conectando de forma segura con la pasarela de pagos...",
      );

      // 1. Iniciar sesión en el backend de iubizon
      const currentProps = propsRef.current;
      const res = await fetch("/api/payments/culqi/initiate", {
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
        throw new Error(
          data.error || "No se pudo iniciar el proceso de pago con Culqi.",
        );
      }

      const { purchaseNumber, sessionKey } = data;
      const publicKey =
        sessionKey || process.env.CULQI_PUBLIC_KEY || "";

      if (!publicKey) {
        throw new Error("La llave pública de Culqi no está configurada.");
      }

      // 2. Cargar SDK de Culqi v4
      await loadCulqiScript();

      if (!window.Culqi) {
        throw new Error("El SDK de Culqi no se inicializó correctamente.");
      }

      const amountInCents = Math.round(Number(currentProps.amount) * 100);

      window.Culqi.publicKey = publicKey;
      window.Culqi.settings({
        title: "iubizon Marketplace",
        currency: "PEN",
        amount: amountInCents,
      });

      const logoUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/images/principal-logo.png`
          : undefined;

      window.Culqi.options({
        lang: "es",
        modal: true,
        installments: false,
        paymentMethods: {
          tarjeta: true,
          yape: true,
          bancaMovil: true,
          agente: true,
          billetera: true,
        },
        style: {
          logo: logoUrl,
          maincolor: "#f25c05",
          buttontext: "#ffffff",
          maintext: "#112237",
          desctext: "#64748b",
        },
      });

      // 3. Callback global que Culqi JS invoca al completar tokenización o cerrar
      window.culqi = async () => {
        console.log("[Culqi] window.culqi ejecutado:", {
          hasToken: Boolean(window.Culqi?.token),
          tokenId: window.Culqi?.token?.id,
          hasError: Boolean(window.Culqi?.error),
          error: window.Culqi?.error,
        });

        if (window.Culqi?.token) {
          const tokenId = window.Culqi.token.id;
          try {
            window.Culqi.close();
          } catch {}

          updateLoading(
            true,
            "Procesando pago seguro y registrando tu orden...",
          );

          try {
            const activeProps = propsRef.current;
            const confirmRes = await fetch("/api/payments/culqi/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                transactionToken: tokenId,
                purchaseNumber,
                amount: activeProps.amount,
                cartItems: activeProps.cartItems,
                shipping: activeProps.shippingForm,
                invoiceDetails: activeProps.invoiceDetails,
              }),
            });

            const confirmData = await confirmRes.json();

            if (!confirmRes.ok || !confirmData.success) {
              throw new Error(
                confirmData.error ||
                  confirmData.actionDescription ||
                  "Pago rechazado por el banco.",
              );
            }

            const successPayload: PaymentSuccessData = {
              orderCode: confirmData.orderCode || purchaseNumber,
              amount: Number(confirmData.amount || activeProps.amount),
              currency: confirmData.currency || "PEN",
              cardBrand: confirmData.cardBrand || null,
              cardLast4: confirmData.cardLast4 || null,
              transactionDate:
                confirmData.transactionDate || new Date().toISOString(),
            };

            activeProps.onSuccess(successPayload);
          } catch (err: unknown) {
            const msg =
              err instanceof Error ? err.message : "Error al procesar el pago.";
            console.error("[Culqi] Error en confirmación:", err);
            updateLoading(false);
            propsRef.current.onError(msg);
          }
        } else if (window.Culqi?.error) {
          const err = window.Culqi.error;
          console.warn("[Culqi] Error devuelto por el SDK:", err);
          const userMsg =
            err.user_message ||
            err.merchant_message ||
            "Error en la validación de la tarjeta.";
          updateLoading(false);
          propsRef.current.onError(userMsg);
        } else {
          // El modal fue cerrado por el usuario
          console.log("[Culqi] Modal cerrado sin token ni error.");
          updateLoading(false);
        }
      };

      updateLoading(false);
      window.Culqi.open();
    } catch (err: unknown) {
      updateLoading(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Error inesperado al iniciar Culqi.";
      console.error("[Culqi] Error al iniciar:", err);
      propsRef.current.onError(msg);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        type="button"
        onClick={handleInitiatePayment}
        disabled={loading}
        className="w-full h-14 bg-[#112237] hover:bg-[#1e3a5f] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{loadingMsg}</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pagar S/ {Number(amount).toFixed(2)} con Culqi</span>
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-4 text-[11px] text-[#64748b]">
        <div className="flex items-center gap-1">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encriptación SSL 256-bit</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Culqi 3DS Seguro</span>
        </div>
      </div>
    </div>
  );
}
