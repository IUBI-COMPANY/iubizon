"use client";

import React from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Info } from "lucide-react";

export type ItemType = "product" | "service" | "item";

export interface WarrantyFieldProps {
  itemType?: ItemType;
  hasWarranty: boolean;
  onHasWarrantyChange: (checked: boolean) => void;
  warrantyOption: string;
  onWarrantyOptionChange: (option: string) => void;
  customWarranty: string;
  onCustomWarrantyChange: (value: string) => void;
  warrantyConditions: string;
  onWarrantyConditionsChange: (value: string) => void;
  className?: string;
}

export const WARRANTY_OPTIONS = [
  { key: "3_months", label: "3 Meses" },
  { key: "6_months", label: "6 Meses" },
  { key: "12_months", label: "12 Meses (1 Año)" },
  { key: "24_months", label: "24 Meses (2 Años)" },
  { key: "custom", label: "Personalizada" },
];

export const WARRANTY_MAP: Record<string, string> = {
  "3_months":
    "3 meses (Garantía del proveedor por falla de fábrica / prestación)",
  "6_months":
    "6 meses (Garantía del proveedor por falla de fábrica / prestación)",
  "12_months": "12 meses / 1 año (Garantía oficial del proveedor / fabricante)",
  "24_months": "24 meses / 2 años (Garantía oficial del fabricante)",
};

export function getFormattedWarrantyText(
  hasWarranty: boolean,
  warrantyOption: string,
  customWarranty: string,
  itemType: ItemType = "item",
): string {
  if (!hasWarranty) {
    return itemType === "service"
      ? "Sin garantía extendida de servicio"
      : "Sin garantía del vendedor";
  }
  if (warrantyOption === "custom") {
    return (
      customWarranty.trim() ||
      (itemType === "service"
        ? "Garantía de servicio del proveedor"
        : "Garantía por falla de fábrica")
    );
  }
  return (
    WARRANTY_MAP[warrantyOption] ||
    (itemType === "service"
      ? "Garantía de servicio (6 meses)"
      : "6 meses por falla de fábrica (Garantía del vendedor)")
  );
}

export const WarrantyField: React.FC<WarrantyFieldProps> = ({
  itemType = "product",
  hasWarranty,
  onHasWarrantyChange,
  warrantyOption,
  onWarrantyOptionChange,
  customWarranty,
  onCustomWarrantyChange,
  warrantyConditions,
  onWarrantyConditionsChange,
  className = "",
}) => {
  const isService = itemType === "service";

  const checkboxLabel = isService
    ? "¿El servicio incluye garantía?"
    : "¿Incluye garantía?";

  const descriptionText = isService
    ? "Selecciona el periodo de garantía ofrecido directamente por tu empresa sobre el servicio prestado."
    : "Selecciona el periodo de garantía ofrecido directamente por tu empresa o el fabricante por fallas de fábrica.";

  const coverageText = isService
    ? "Conformidad, idoneidad y rectificación sin costo del servicio prestado."
    : "Fallas de fabricación y componentes defectuosos de origen.";

  return (
    <div
      className={`bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm space-y-3.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-[#112237]">Garantía</Label>
        <span className="text-xs text-[#64748b] bg-[#f8fafc] px-2 py-0.5 rounded-md border border-[#e2e8f0]">
          Garantía del proveedor
        </span>
      </div>

      <Checkbox
        name="hasWarranty"
        checked={hasWarranty}
        onChange={(checked) => onHasWarrantyChange(checked)}
      >
        <span className="font-semibold text-sm text-[#112237]">
          {checkboxLabel}
        </span>
      </Checkbox>

      {hasWarranty && (
        <div className="space-y-3 pt-2 border-t border-[#f1f5f9]">
          <p className="text-xs text-[#64748b]">{descriptionText}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {WARRANTY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onWarrantyOptionChange(opt.key)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  warrantyOption === opt.key
                    ? "border-[#f25c05] bg-[#f25c05]/10 text-[#f25c05]"
                    : "border-[#e2e8f0] bg-white text-[#475569] hover:border-[#cbd5e1]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {warrantyOption === "custom" && (
            <Input
              placeholder={
                isService
                  ? "Ej: 30 días de soporte y corrección sin costo"
                  : "Ej: 90 días con servicio técnico autorizado"
              }
              value={customWarranty}
              onChange={(e) => onCustomWarrantyChange(e.target.value)}
              className="mt-2 text-xs"
            />
          )}

          <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] space-y-2 mt-3 text-xs text-[#64748b]">
            <p className="font-semibold text-[#112237] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#f25c05] shrink-0" />
              <span>Cobertura estándar:</span>{" "}
              <span className="font-normal text-[#475569]">{coverageText}</span>
            </p>
            <div>
              <Label className="text-[11px] font-semibold text-[#112237] block mb-1">
                Condiciones especiales o requisitos (opcional)
              </Label>
              <Input
                placeholder={
                  isService
                    ? "Ej: No aplica en modificaciones realizadas por terceros."
                    : "Ej: Conservar empaque original y comprobante."
                }
                value={warrantyConditions}
                onChange={(e) => onWarrantyConditionsChange(e.target.value)}
                className="bg-white text-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
