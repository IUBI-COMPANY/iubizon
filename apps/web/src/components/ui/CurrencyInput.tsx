"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { Alert } from "@/components/ui/Alert";

export type CurrencyCode = "PEN" | "USD" | "EUR";

export interface CurrencyOption {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyOption> = {
  PEN: { code: "PEN", symbol: "S/", label: "Soles (S/)" },
  USD: { code: "USD", symbol: "$", label: "Dólares ($)" },
  EUR: { code: "EUR", symbol: "€", label: "Euros (€)" },
};

export interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  currency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  allowCurrencyChange?: boolean;
  error?: string | boolean;
  showTaxAlert?: boolean;
  taxAlertMessage?: string;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(
  (
    {
      className,
      value,
      onChange,
      currency = "PEN",
      onCurrencyChange,
      allowCurrencyChange = false,
      error,
      placeholder = "0.00",
      showTaxAlert = true,
      taxAlertMessage = "El precio debe incluir costos adicionales y los impuestos de acuerdo a ley.",
      ...props
    },
    ref,
  ) => {
    const selectedCurrency = CURRENCIES[currency] || CURRENCIES.PEN;

    return (
      <div className="relative w-full space-y-2">
        <div
          className={cn(
            "flex h-11 w-full rounded-xl border border-[#e2e8f0] bg-white transition-all overflow-hidden focus-within:ring-2 focus-within:ring-[#f25c05] focus-within:border-transparent",
            error && "border-[#ef4444] focus-within:ring-[#ef4444]",
          )}
        >
          {/* Tag de moneda (Soles / Futuras monedas) */}
          <div className="flex items-center gap-1 px-3.5 bg-[#f8fafc] border-r border-[#e2e8f0] text-xs font-bold text-[#112237] shrink-0 select-none">
            <span>{selectedCurrency.symbol}</span>
            {allowCurrencyChange && onCurrencyChange ? (
              <select
                value={currency}
                onChange={(e) =>
                  onCurrencyChange(e.target.value as CurrencyCode)
                }
                className="bg-transparent text-xs font-bold text-[#112237] focus:outline-none cursor-pointer"
              >
                {Object.values(CURRENCIES).map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] text-[#64748b] font-semibold uppercase ml-0.5">
                {selectedCurrency.code}
              </span>
            )}
            {allowCurrencyChange && (
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
            )}
          </div>

          {/* Campo numérico */}
          <input
            type="number"
            step="0.01"
            min="0"
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent px-3 py-2 text-sm font-medium text-[#112237] placeholder:text-[#94a3b8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            {...props}
          />
        </div>

        {error && typeof error === "string" && (
          <p className="mt-1 text-xs text-[#ef4444]">{error}</p>
        )}

        {showTaxAlert && (
          <Alert
            variant="info"
            message={taxAlertMessage}
            className="py-2.5 px-3.5 text-xs rounded-xl"
          />
        )}
      </div>
    );
  },
);

CurrencyInput.displayName = "CurrencyInput";
