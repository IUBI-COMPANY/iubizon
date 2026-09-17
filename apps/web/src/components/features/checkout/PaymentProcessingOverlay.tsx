"use client";

import { useEffect } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

interface PaymentProcessingOverlayProps {
  isVisible: boolean;
  message?: string;
  title?: string;
}

export function PaymentProcessingOverlay({
  isVisible,
  message = "Estamos validando la transacción con la entidad bancaria...",
  title = "Procesando Pago Seguro",
}: PaymentProcessingOverlayProps) {
  // Bloquear el scroll del body mientras el overlay de procesamiento esté activo
  useEffect(() => {
    if (isVisible) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
      className="fixed inset-0 z-[99999] bg-[#0f172a]/80 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center select-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center space-y-5 border border-slate-100 transform transition-all scale-100">
        {/* Indicador animado */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center text-[#f25c05] animate-pulse">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full shadow-md">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Título y Mensaje */}
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-[#112237] text-lg sm:text-xl tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
            {message}
          </p>
        </div>

        {/* Advertencia de No Recargar */}
        <div className="w-full bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-center gap-2.5 text-left">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-[11px] text-amber-900 font-medium leading-tight">
            Por favor,{" "}
            <strong className="font-bold">no cierres ni recargues</strong> esta
            ventana mientras se confirma la operación.
          </p>
        </div>

        {/* Certificación de Seguridad */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider pt-1">
          <span>Encriptación SSL 256-bit</span>
          <span>•</span>
          <span>PCI DSS Compliant</span>
        </div>
      </div>
    </div>
  );
}
