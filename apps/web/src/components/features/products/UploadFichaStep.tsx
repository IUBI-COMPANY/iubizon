"use client";

import { useState } from "react";
import { FileText, Sparkles, ArrowRight, Upload } from "lucide-react";
import { FichaRucUploader } from "@/components/ui/FichaRucUploader";
import { Button } from "@/components/ui/Button";
import type { ExtractedCompanyData } from "@/lib/services/documentExtractor";

interface UploadFichaStepProps {
  onNext: (docUrl: string, extractedData: ExtractedCompanyData | null) => void;
}

export const UploadFichaStep = ({ onNext }: UploadFichaStepProps) => {
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedCompanyData | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleDocumentUploaded = (url: string, data?: ExtractedCompanyData | null) => {
    setDocUrl(url);
    setExtractedData(data ?? null);
    setIsUploaded(true);
  };

  const handleContinue = () => {
    if (!docUrl) return;
    onNext(docUrl, extractedData);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[#f1f5f9]">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-[#f25c05]/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#f25c05]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#112237]">
              Sube tu Ficha RUC o Reporte SUNAT
            </h2>
            <p className="text-xs text-[#64748b]">
              La IA analizará el PDF y pre-rellenará todos los campos automáticamente
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Uploader */}
        <FichaRucUploader
          label="Adjunta tu Ficha RUC o Reporte SUNAT (PDF)"
          helperText="Sube el PDF oficial de SUNAT. La Inteligencia Artificial extraerá tu RUC, Razón Social, Nombre Comercial, dirección, teléfono y correo automáticamente."
          value={docUrl ?? undefined}
          onDocumentUploaded={handleDocumentUploaded}
        />

        {/* Preview de datos extraídos */}
        {isUploaded && extractedData && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              Datos extraídos por IA — revísalos en el siguiente paso
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {extractedData.tax_id && (
                <DataRow label="RUC" value={extractedData.tax_id} />
              )}
              {extractedData.legal_name && (
                <DataRow label="Razón Social" value={extractedData.legal_name} />
              )}
              {extractedData.name && extractedData.name !== extractedData.legal_name && (
                <DataRow label="Nombre Comercial" value={extractedData.name} />
              )}
              {extractedData.phone && (
                <DataRow label="Teléfono" value={extractedData.phone} />
              )}
              {extractedData.email && (
                <DataRow label="Correo" value={extractedData.email} />
              )}
              {extractedData.district && extractedData.province && (
                <DataRow
                  label="Ubicación"
                  value={`${extractedData.district}, ${extractedData.province}`}
                />
              )}
            </div>
            {extractedData.description && (
              <div className="pt-2 border-t border-emerald-100 min-w-0">
                <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Descripción Generada</p>
                <p className="text-xs text-[#112237] font-medium italic line-clamp-2">"{extractedData.description}"</p>
              </div>
            )}
          </div>
        )}

        {/* Si subió el PDF pero sin datos extraídos */}
        {isUploaded && !extractedData && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            <p className="font-semibold mb-0.5">PDF adjuntado correctamente</p>
            <p>Podrás ingresar los datos manualmente en el siguiente paso.</p>
          </div>
        )}

        {/* Botón continuar */}
        <div className="pt-2">
          <Button
            type="button"
            disabled={!isUploaded}
            onClick={handleContinue}
            className="w-full h-12 bg-[#f25c05] hover:bg-[#d94d04] disabled:opacity-40 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
          >
            {isUploaded ? (
              <>
                Continuar con los datos extraídos
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Sube el PDF para continuar
              </>
            )}
          </Button>
          <p className="text-[11px] text-center text-[#94a3b8] mt-2">
            El PDF no se comparte con nadie — solo se usa para extraer datos
          </p>
        </div>
      </div>
    </div>
  );
};

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-xs text-[#112237] font-medium truncate">{value}</p>
    </div>
  );
}
