"use client";

import { FileText, Receipt, AlertTriangle, Info } from "lucide-react";
import { Input } from "@/components/ui/Input";

export type InvoiceType = "boleta" | "factura";
export type DocType = "dni" | "ce" | "pasaporte";

const DOC_LABELS: Record<DocType, string> = {
  dni: "DNI",
  ce: "C.E.",
  pasaporte: "Pasaporte",
};

const DOC_OPTIONS: { value: DocType; label: string }[] = [
  { value: "dni", label: "DNI" },
  { value: "ce", label: "Carnet de Extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-[#112237] mb-1"
    >
      {children}
    </label>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-[#64748b] mt-1">{children}</p>;
}

function InvoiceOption({
  value,
  current,
  icon: Icon,
  label,
  sublabel,
  onClick,
}: {
  value: InvoiceType;
  current: InvoiceType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
        active
          ? "border-[#f25c05] bg-white ring-2 ring-[#f25c05]/20 shadow-xs"
          : "border-[#e2e8f0] bg-white hover:border-[#cbd5e1]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            active ? "bg-[#f25c05] text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-[#112237]">{label}</p>
          <p className="text-[10px] text-[#64748b]">{sublabel}</p>
        </div>
      </div>
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
          active ? "border-[#f25c05] bg-[#f25c05]" : "border-slate-300"
        }`}
      >
        {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
    </button>
  );
}

function AlertBanner({
  variant,
  children,
}: {
  variant: "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    warning: {
      wrap: "bg-red-50 border-red-200",
      icon: "text-red-500",
      text: "text-red-700",
      Icon: AlertTriangle,
    },
    info: {
      wrap: "bg-amber-50 border-amber-200",
      icon: "text-amber-500",
      text: "text-amber-700",
      Icon: Info,
    },
  }[variant];

  return (
    <div
      className={`flex items-start gap-2 mb-3 p-2.5 border rounded-xl ${styles.wrap}`}
    >
      <styles.Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${styles.icon}`} />
      <p className={`text-[11px] leading-relaxed ${styles.text}`}>{children}</p>
    </div>
  );
}

// ── Boleta fields ────────────────────────────────────────────────────────────

function BoletaFields({
  docType,
  onDocTypeChange,
  invoiceDni,
  onDniChange,
  required,
}: {
  docType: DocType;
  onDocTypeChange: (v: DocType) => void;
  invoiceDni: string;
  onDniChange: (v: string) => void;
  required: boolean;
}) {
  return (
    <div className="pt-3 border-t border-[#e2e8f0]">
      {required ? (
        <AlertBanner variant="warning">
          Tu pedido supera <strong>S/ 700</strong> — la SUNAT{" "}
          <strong>exige obligatoriamente</strong> tu número de documento para
          emitir la boleta.
        </AlertBanner>
      ) : (
        <AlertBanner variant="info">
          Para montos mayores a <strong>S/ 700</strong>, la SUNAT exige tu
          número de documento en la boleta.
        </AlertBanner>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <FieldLabel htmlFor="docType">Tipo de doc.</FieldLabel>
          <select
            id="docType"
            value={docType}
            onChange={(e) => onDocTypeChange(e.target.value as DocType)}
            className="w-full h-10 rounded-xl border border-[#e2e8f0] bg-white px-3 text-xs text-[#112237] focus:outline-none focus:ring-2 focus:ring-[#f25c05]/30 focus:border-[#f25c05] transition-all"
          >
            {DOC_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <FieldLabel htmlFor="invoiceDni">
            Número de {DOC_LABELS[docType]}
            {required ? (
              <span className="text-[#f25c05] ml-1">*</span>
            ) : (
              <span className="text-[#94a3b8] font-normal ml-1">
                (opcional)
              </span>
            )}
          </FieldLabel>
          <Input
            id="invoiceDni"
            type="text"
            maxLength={docType === "dni" ? 8 : 20}
            placeholder={
              docType === "dni" ? "Ej: 45678901" : "Número de documento"
            }
            value={invoiceDni}
            onChange={(e) => onDniChange(e.target.value.replace(/\D/g, ""))}
          />
          <FieldHint>
            {docType === "dni" ? "8 dígitos" : "Hasta 20 caracteres"}
          </FieldHint>
        </div>
      </div>
    </div>
  );
}

// ── Factura fields ───────────────────────────────────────────────────────────

function FacturaFields({
  invoiceRuc,
  onRucChange,
  invoiceCompanyName,
  onCompanyNameChange,
}: {
  invoiceRuc: string;
  onRucChange: (v: string) => void;
  invoiceCompanyName: string;
  onCompanyNameChange: (v: string) => void;
}) {
  return (
    <div className="pt-3 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <div>
        <FieldLabel htmlFor="invoiceRuc">
          Número de RUC <span className="text-[#f25c05]">*</span>
        </FieldLabel>
        <Input
          id="invoiceRuc"
          type="text"
          maxLength={11}
          placeholder="Ej: 20601234567"
          value={invoiceRuc}
          onChange={(e) => onRucChange(e.target.value.replace(/\D/g, ""))}
        />
        <FieldHint>11 dígitos numéricos</FieldHint>
      </div>

      <div>
        <FieldLabel htmlFor="invoiceCompanyName">
          Razón Social <span className="text-[#f25c05]">*</span>
        </FieldLabel>
        <Input
          id="invoiceCompanyName"
          type="text"
          placeholder="Ej: Servicios Integrales SAC"
          value={invoiceCompanyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
        />
        <FieldHint>Nombre registrado en SUNAT</FieldHint>
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────

export interface InvoiceSelectorProps {
  invoiceType: InvoiceType;
  onInvoiceTypeChange: (t: InvoiceType) => void;
  docType: DocType;
  onDocTypeChange: (t: DocType) => void;
  invoiceDni: string;
  onDniChange: (v: string) => void;
  invoiceRuc: string;
  onRucChange: (v: string) => void;
  invoiceCompanyName: string;
  onCompanyNameChange: (v: string) => void;
  grandTotal: number;
}

export function InvoiceSelector({
  invoiceType,
  onInvoiceTypeChange,
  docType,
  onDocTypeChange,
  invoiceDni,
  onDniChange,
  invoiceRuc,
  onRucChange,
  invoiceCompanyName,
  onCompanyNameChange,
  grandTotal,
}: InvoiceSelectorProps) {
  return (
    <div className="bg-[#f8fafc] rounded-2xl p-5 border border-[#e2e8f0] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#f25c05]" />
          <h3 className="text-xs font-bold text-[#112237] uppercase tracking-wider">
            Tipo de Comprobante de Pago
          </h3>
        </div>
        <span className="text-[11px] text-[#64748b]">
          Elige cómo deseas tu comprobante
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InvoiceOption
          value="boleta"
          current={invoiceType}
          icon={Receipt}
          label="Boleta de Venta"
          sublabel="Para persona natural"
          onClick={() => onInvoiceTypeChange("boleta")}
        />
        <InvoiceOption
          value="factura"
          current={invoiceType}
          icon={FileText}
          label="Factura Electrónica"
          sublabel="Para empresas (con RUC)"
          onClick={() => onInvoiceTypeChange("factura")}
        />
      </div>

      {/* Conditional fields */}
      {invoiceType === "boleta" && (
        <BoletaFields
          docType={docType}
          onDocTypeChange={onDocTypeChange}
          invoiceDni={invoiceDni}
          onDniChange={onDniChange}
          required={grandTotal > 700}
        />
      )}
      {invoiceType === "factura" && (
        <FacturaFields
          invoiceRuc={invoiceRuc}
          onRucChange={onRucChange}
          invoiceCompanyName={invoiceCompanyName}
          onCompanyNameChange={onCompanyNameChange}
        />
      )}
    </div>
  );
}

// ── Invoice summary text (used in order review) ──────────────────────────────

export function InvoiceSummaryText({
  invoiceType,
  invoiceRuc,
  invoiceCompanyName,
  invoiceDni,
  docType,
}: Pick<
  InvoiceSelectorProps,
  "invoiceType" | "invoiceRuc" | "invoiceCompanyName" | "invoiceDni" | "docType"
>) {
  if (invoiceType === "factura") {
    return (
      <span className="font-semibold text-[#f25c05]">
        Factura Electrónica — RUC: {invoiceRuc || "Pendiente"} (
        {invoiceCompanyName || "Sin Razón Social"})
      </span>
    );
  }
  return (
    <span>
      Boleta de Venta
      {invoiceDni && (
        <>
          {" "}
          — {DOC_LABELS[docType]}: {invoiceDni}
        </>
      )}
    </span>
  );
}
