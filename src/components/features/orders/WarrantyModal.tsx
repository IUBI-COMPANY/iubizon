"use client";

import React from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface WarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderCode: string;
  createdAt: string;
  sellerName?: string | null;
  productTitle?: string;
  warrantyText?: string;
  warrantyConditions?: string | null;
}

export const WarrantyModal: React.FC<WarrantyModalProps> = ({
  isOpen,
  onClose,
  orderCode,
  createdAt,
  sellerName,
  productTitle,
  warrantyText = "6 meses por falla de fábrica (Garantía del vendedor)",
  warrantyConditions,
}) => {
  if (!isOpen) return null;

  // Calcular si está dentro de los 7 días de protección Iubizon
  const orderDate = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24),
  );
  const isWithin7Days = diffDays <= 7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f0] relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f25c05]/10 rounded-2xl flex items-center justify-center text-[#f25c05]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#112237]">
                Garantía & Cobertura
              </h3>
              <p className="text-xs text-[#64748b]">Orden #{orderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info del Producto y Vendedor */}
        <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2">
          {productTitle && (
            <p className="text-xs font-bold text-[#112237] line-clamp-1">
              📦 {productTitle}
            </p>
          )}
          {sellerName && (
            <p className="text-xs text-[#64748b] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#f25c05]" />
              <span>
                Vendido por:{" "}
                <strong className="text-[#334155]">{sellerName}</strong>
              </span>
            </p>
          )}
        </div>

        {/* Estado de la Cobertura */}
        <div className="space-y-3">
          {/* Protección 7 Días Iubizon */}
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${
              isWithin7Days
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-slate-50 border-slate-200 text-slate-600"
            }`}
          >
            <CheckCircle2
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                isWithin7Days ? "text-emerald-600" : "text-slate-400"
              }`}
            />
            <div className="space-y-0.5">
              <p className="font-bold text-[#112237]">
                Protección al Comprador Iubizon (7 Días)
              </p>
              <p className="text-[11px] text-[#475569]">
                {isWithin7Days
                  ? `Te quedan ${7 - diffDays} días de protección directa para reportar cualquier disconformidad con reembolso garantizado.`
                  : "El periodo inicial de 7 días de entrega ha concluido. Tu cobertura continúa con la garantía del vendedor."}
              </p>
            </div>
          </div>

          {/* Garantía del Vendedor */}
          <div className="p-3.5 rounded-2xl border border-[#e2e8f0] bg-white space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#112237] uppercase tracking-wider text-[11px]">
                Garantía del Vendedor
              </span>
              <span className="text-[11px] font-bold text-[#f25c05] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                {warrantyText}
              </span>
            </div>
            <p className="text-[11px] text-[#64748b]">
              <strong>Cobertura:</strong> Fallas de fabricación y componentes
              defectuosos de origen.
            </p>
            {warrantyConditions && (
              <p className="text-[11px] text-[#64748b]">
                📋 <strong>Condiciones:</strong> {warrantyConditions}
              </p>
            )}
          </div>
        </div>

        {/* Pasos para hacer efectiva la garantía */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#112237]">
            Pasos para usar tu garantía:
          </p>
          <ol className="text-[11px] text-[#475569] space-y-1.5 list-decimal list-inside pl-1">
            <li>
              Conserva tu comprobante de compra y código de orden (
              <strong>#{orderCode}</strong>).
            </li>
            <li>
              Informa la falla al vendedor detallando la evidencia técnica.
            </li>
            <li>
              Si el vendedor no responde, solicita la{" "}
              <strong>Mediación Iubizon</strong>.
            </li>
          </ol>
        </div>

        {/* Acciones */}
        <div className="pt-2 border-t border-[#f1f5f9] flex flex-col sm:flex-row gap-2">
          {isWithin7Days ? (
            <Button
              className="w-full bg-[#f25c05] hover:bg-[#d94d04] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
              onClick={() => {
                onClose();
                alert(
                  `Iniciando reclamo de Protección 7 días para la orden #${orderCode}. Nuestro equipo te contactará de inmediato.`,
                );
              }}
            >
              <AlertCircle className="w-4 h-4" />
              <span>Reportar Problema (Protección 7 Días)</span>
            </Button>
          ) : (
            <Button
              className="w-full bg-[#112237] hover:bg-[#1a3352] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2"
              onClick={() => {
                onClose();
                alert(
                  `Solicitud de mediación enviada para la orden #${orderCode}. Un agente de Iubizon revisará el caso con el vendedor.`,
                );
              }}
            >
              <HelpCircle className="w-4 h-4 text-[#f25c05]" />
              <span>Solicitar Mediación Iubizon</span>
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full text-xs font-semibold py-2.5 rounded-xl border-[#cbd5e1] hover:bg-slate-50"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
