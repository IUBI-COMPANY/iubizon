"use client";

import { ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CartSummarySidebarProps {
  step: number;
  subtotal: number;
  taxAmount?: number;
  shippingCost: number;
  grandTotal: number;
  itemCount: number;
  onNextStep?: () => void;
  disabled?: boolean;
}

export const CartSummarySidebar = ({
  step,
  subtotal,
  taxAmount,
  shippingCost,
  grandTotal,
  itemCount,
  onNextStep,
  disabled = false,
}: CartSummarySidebarProps) => {
  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm sticky top-24 space-y-4">
      <h3 className="font-bold text-base text-[#112237] border-b border-[#f1f5f9] pb-3">
        {step === 3 ? "Desglose del Pedido" : "Resumen del Pedido"}
      </h3>

      <div className="space-y-2.5 text-xs text-[#64748b]">
        {step !== 3 && (
          <div className="flex justify-between">
            <span>Ítems seleccionados:</span>
            <span className="font-bold text-[#112237]">
              {itemCount} productos
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Subtotal de productos:</span>
          <span className="font-bold text-[#112237]">
            S/ {subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-[#f25c05]" />
            Costo de Envío:
          </span>
          <span className="font-bold text-emerald-600 flex items-center gap-1">
            <span>GRATIS</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full uppercase">
              Lanzamiento
            </span>
          </span>
        </div>

        <div className="pt-2 border-t border-[#f1f5f9] flex justify-between items-center text-sm font-extrabold text-[#112237]">
          <span>Total a Pagar:</span>
          <span className="text-lg sm:text-xl text-[#f25c05]">
            S/ {grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {step === 1 && onNextStep && (
        <Button
          onClick={onNextStep}
          disabled={disabled || itemCount === 0}
          className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
        >
          <span>Continuar a Datos de Envío</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}

      {step === 3 && (
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-[11px] text-[#64748b] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#112237]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Garantía de Satisfacción</span>
          </div>
          <p>
            Tu pago se procesa de forma 100% segura con encriptación PCI-DSS y
            garantía de protección al comprador Iubizon.
          </p>
        </div>
      )}
    </div>
  );
};
