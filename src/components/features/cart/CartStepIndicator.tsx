"use client";

interface CartStepIndicatorProps {
  step: number;
  onStepChange: (step: number) => void;
  canGoToStep2: boolean;
  canGoToStep3: boolean;
}

export const CartStepIndicator = ({
  step,
  onStepChange,
  canGoToStep2,
  canGoToStep3,
}: CartStepIndicatorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 bg-white p-2 rounded-2xl border border-[#e2e8f0] shadow-sm">
      <button
        onClick={() => onStepChange(1)}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
          step === 1
            ? "bg-[#112237] text-white shadow-md"
            : step > 1
              ? "bg-emerald-50 text-emerald-700"
              : "text-[#64748b] hover:bg-slate-50"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
          {step > 1 ? "✓" : "1"}
        </span>
        <span className="hidden sm:inline">1. Carrito & Ofertas</span>
        <span className="sm:hidden">1. Carrito</span>
      </button>

      <button
        onClick={() => canGoToStep2 && onStepChange(2)}
        disabled={!canGoToStep2}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
          step === 2
            ? "bg-[#112237] text-white shadow-md"
            : step > 2
              ? "bg-emerald-50 text-emerald-700"
              : "text-[#64748b] hover:bg-slate-50 disabled:opacity-50"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
          {step > 2 ? "✓" : "2"}
        </span>
        <span className="hidden sm:inline">2. Datos de Envío</span>
        <span className="sm:hidden">2. Envío</span>
      </button>

      <button
        onClick={() => canGoToStep3 && onStepChange(3)}
        disabled={!canGoToStep3}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold transition-all ${
          step === 3
            ? "bg-[#112237] text-white shadow-md"
            : "text-[#64748b] hover:bg-slate-50 disabled:opacity-50"
        }`}
      >
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
          3
        </span>
        <span className="hidden sm:inline">3. Confirmar & Pago</span>
        <span className="sm:hidden">3. Pago</span>
      </button>
    </div>
  );
};
