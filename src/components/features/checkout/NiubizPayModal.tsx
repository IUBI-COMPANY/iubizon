"use client";

import { useState } from "react";
import { CreditCard, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NiubizPayModalProps {
  amount: number;
  cartItems: any[];
  shippingForm: any;
  invoiceDetails: any;
  onValidate?: () => boolean;
  onSuccess: (orderCode: string) => void;
  onError: (errorMessage: string) => void;
}

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
}: NiubizPayModalProps) {
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(
    "Conectando con la pasarela de pagos segura Niubiz...",
  );

  // 1. Iniciar sesión de pago y abrir formulario modal
  const handleInitiatePayment = async () => {
    if (onValidate && !onValidate()) {
      return;
    }

    try {
      setLoadingMsg("Conectando con la pasarela de pagos segura Niubiz...");
      setLoadingSession(true);

      const res = await fetch("/api/payments/niubiz/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          cartItems,
          shipping: shippingForm,
          invoiceDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "No se pudo iniciar el proceso de pago.");
      }

      await loadNiubizScript(data.environment);

      if (!window.VisanetCheckout) {
        throw new Error(
          "El módulo de pago de Niubiz no está disponible en este momento.",
        );
      }

      // Ocultar loading antes de mostrar el formulario de Niubiz
      setLoadingSession(false);

      window.VisanetCheckout.configure({
        sessiontoken: data.sessionKey,
        channel: "web",
        merchantid: data.merchantId,
        purchasenumber: Number(data.purchaseNumber),
        amount: Number(amount.toFixed(2)),
        expirationminutes: "20",
        timeouturl: `${window.location.origin}/cart?error=timeout`,
        merchantlogo: `${window.location.origin}/images/logo.png`,
        formbuttoncolor: "#f25c05",
        action: `${window.location.origin}/api/payments/niubiz/authorize?purchaseNumber=${data.purchaseNumber}&amount=${amount}`,
        complete: async (response: any) => {
          if (response && response.transactionToken) {
            await processAuthorization(
              response.transactionToken,
              data.purchaseNumber,
            );
          } else {
            onError("El formulario de pago fue cerrado sin completar la transacción.");
          }
        },
      });

      window.VisanetCheckout.open();
    } catch (err: unknown) {
      setLoadingSession(false);
      const msg =
        err instanceof Error ? err.message : "Error al conectarse con Niubiz.";
      onError(msg);
    }
  };

  // 2. Procesar autorización Server-to-Server
  const processAuthorization = async (
    transactionToken: string,
    purchaseNumber: string,
  ) => {
    try {
      setLoadingMsg("Verificando tarjeta y registrando tu pedido...");
      setLoadingSession(true);
      const res = await fetch("/api/payments/niubiz/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionToken,
          purchaseNumber,
          amount,
          cartItems,
          shipping: shippingForm,
          invoiceDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "La tarjeta fue denegada por el banco emisor.",
        );
      }

      setLoadingMsg(
        "¡Pago Aprobado! Redireccionando al comprobante de tu compra...",
      );
      onSuccess(data.orderCode || data.sessionCode);
    } catch (err: unknown) {
      setLoadingSession(false);
      const msg =
        err instanceof Error ? err.message : "Error al confirmar el pago.";
      onError(msg);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Overlay Bloqueante de Carga en Pantalla Completa */}
      {loadingSession && (
        <div className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-fade-in select-none">
          <div className="bg-[#112237] border border-slate-700/80 p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#f25c05]/20 border-t-[#f25c05] animate-spin" />
              <ShieldCheck className="w-8 h-8 text-[#f25c05] absolute" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white mb-1.5">
                Procesando Pago Seguro
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {loadingMsg}
              </p>
            </div>
            <div className="w-full bg-slate-800/80 py-2.5 px-4 rounded-xl border border-slate-700 text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Protegido con encriptación PCI-DSS 256-bit</span>
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={handleInitiatePayment}
        disabled={loadingSession}
        className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold py-4 px-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 text-base tracking-wide active:scale-[0.99]"
      >
        {loadingSession ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Conectando con Niubiz...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>Pagar S/ {amount.toFixed(2)} con Tarjeta (Niubiz)</span>
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
