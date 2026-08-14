"use client";

import type { PaymentMethodDefinition } from "@/components/features/checkout/paymentWidgets";

interface PaymentMethodsProps {
  methods: PaymentMethodDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** Selector de método de pago tipo "radio cards". */
export function PaymentMethods({
  methods,
  selectedId,
  onSelect,
}: PaymentMethodsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {methods.map((method) => {
        const active = method.id === selectedId;
        const Icon = method.icon;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`p-4 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
              active
                ? "border-[#f25c05] bg-orange-50/50 shadow-sm"
                : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                active
                  ? "bg-[#f25c05] text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#112237]">{method.label}</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">
                {method.description}
              </p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                active ? "border-[#f25c05] bg-[#f25c05]" : "border-[#cbd5e1]"
              }`}
            >
              {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
