"use client";

import { useRef, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { ExtractedCompanyData } from "@/lib/services/documentExtractor";

export interface FichaRucUploaderProps {
  value?: string | null;
  onDocumentUploaded?: (
    url: string,
    extractedData?: ExtractedCompanyData | null,
    fileName?: string,
  ) => void;
  disabled?: boolean;
  companyId?: string | null;
  compact?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
}

export function FichaRucUploader({
  value,
  onDocumentUploaded,
  disabled = false,
  companyId = null,
  compact = false,
  label = "Ficha RUC o Reporte SUNAT (PDF)",
  helperText = "Adjunta tu Ficha RUC en PDF para que la Inteligencia Artificial analice y autocomplete los datos de tu empresa.",
  className = "",
}: FichaRucUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [documentName, setDocumentName] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error(
        "Únicamente se permiten archivos en formato PDF (.pdf)",
        "Documento Inválido",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        "El archivo excede el tamaño máximo permitido (10MB)",
        "Tamaño Excedido",
      );
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (companyId) {
        formData.append("company_id", companyId);
      }

      const res = await fetch("/api/companies/document", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Error al subir la Ficha RUC PDF");
      }

      setDocumentName(file.name);

      if (result.extractedData) {
        toast.success(
          "✨ Ficha RUC analizada por IA. Los datos de la empresa se autocompletaron.",
          "Ficha RUC Procesada",
        );
      } else {
        toast.success("Documento Ficha RUC (PDF) adjuntado con éxito.");
      }

      if (onDocumentUploaded) {
        onDocumentUploaded(result.url, result.extractedData, file.name);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al procesar la Ficha RUC";
      console.error("[FichaRucUploader] Error:", msg);
      toast.error(msg, "Error de Carga");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (compact) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={disabled || isUploading}
        />
        {value ? (
          <div className="flex items-center justify-between gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-900 truncate">
                {documentName || "Ficha_RUC.pdf"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Ver PDF <ExternalLink className="w-3 h-3" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="h-6 px-2 text-[10px] text-emerald-800 hover:bg-emerald-100"
              >
                Cambiar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-full h-9 border-dashed border-[#f25c05] text-[#f25c05] hover:bg-[#f25c05]/5 font-semibold text-xs flex items-center justify-center gap-1.5 rounded-xl"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#f25c05] animate-pulse" />
                  IA Analizando Ficha RUC...
                </span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 text-[#f25c05]" />
                Adjuntar Ficha RUC (PDF máx 10MB)
              </>
            )}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="block text-sm font-bold text-[#112237] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#f25c05]" />
            {label}
          </label>
          {helperText && (
            <p className="text-xs text-[#64748b] mt-1">{helperText}</p>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div className="mt-3">
        {value ? (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-emerald-900 truncate">
                {documentName || "Ficha_RUC_Adjuntada.pdf"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
              >
                Ver PDF <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
                className="h-7 text-xs text-emerald-800 hover:bg-emerald-100 font-semibold"
              >
                Reemplazar PDF
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="w-full h-11 border-dashed border-[#f25c05] text-[#f25c05] hover:bg-[#f25c05]/5 font-semibold text-xs flex items-center justify-center gap-2 rounded-xl"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#f25c05]" />
                <Sparkles className="w-4 h-4 text-[#f25c05] animate-bounce" />
                <span className="font-bold">
                  IA Analizando Ficha RUC (PDF)...
                </span>
              </span>
            ) : (
              <>
                <Upload className="w-4 h-4 text-[#f25c05]" />
                Adjuntar Ficha RUC en PDF (Autocompletado IA)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
