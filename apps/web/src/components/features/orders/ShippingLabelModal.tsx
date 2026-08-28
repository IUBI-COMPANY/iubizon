"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Barcode } from "@/components/ui/Barcode";
import {
  Printer,
  Building2,
  Phone,
  User,
} from "lucide-react";

export interface ShippingLabelData {
  orderCode: string;
  packageNumber: number;
  totalPackages: number;
  trackingId: string;
  courier?: string | null;
  carrierTrackingNumber?: string | null;
  carrierPhone?: string | null;
  createdAt?: string | null;
  estimatedDelivery?: string | null;
  // Remitente (Vendedor / Tienda)
  companyName: string;
  companyLegalName?: string | null;
  companyTaxId?: string | null;
  companyPhone?: string | null;
  companyLocation?: string | null;
  // Destinatario (Comprador / Destino)
  buyerName: string;
  buyerDocumentType?: string | null;
  buyerDocumentNumber?: string | null;
  buyerPhone?: string | null;
  destinationAddress: string | null;
  destinationDistrict?: string | null;
  destinationProvince?: string | null;
  destinationDepartment?: string | null;
  destinationReference?: string | null;
  // Contenido
  items: Array<{
    id?: string;
    title: string;
    quantity: number;
  }>;
}

interface ShippingLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ShippingLabelData | null;
}

function formatDate(isoString: string | null | undefined) {
  if (!isoString) return new Date().toLocaleDateString("es-PE");
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
}

export function ShippingLabelModal({
  isOpen,
  onClose,
  data,
}: ShippingLabelModalProps) {
  const labelRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const totalUnits = data.items.reduce(
    (acc, i) => acc + (i.quantity || 1),
    0,
  );

  const destinationCity = [
    data.destinationDistrict,
    data.destinationProvince,
    data.destinationDepartment,
  ]
    .filter(Boolean)
    .join(" - ");

  const handlePrint = () => {
    const printContent = labelRef.current;
    if (!printContent) {
      window.print();
      return;
    }

    // Extraer todos los estilos (Tailwind CSS, fuentes y reglas globales) de la página principal
    const headStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((el) => el.outerHTML)
      .join("\n");

    // Crear iframe aislado para impresión directa
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <title>Rótulo de Despacho - Orden #${data.orderCode}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          ${headStyles}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              background: #ffffff !important;
              color: #000000 !important;
              padding: 0 !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-container {
              width: 100% !important;
              max-width: 175mm !important;
              margin: 0 auto !important;
            }
          </style>
        </head>
        <body class="bg-white p-4">
          <div class="print-container">
            ${printContent.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-3xl">
        <DialogHeader className="border-b border-[#f1f5f9] pb-3 print:hidden">
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f25c05] flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-black text-[#112237]">
                  Rótulo Oficial de Envío & Despacho
                </DialogTitle>
                <span className="text-xs text-slate-500 font-semibold">
                  Formato compatible para Shalom, Olva Courier y Envíos Directos
                </span>
              </div>
            </div>

            <Button
              type="button"
              onClick={handlePrint}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Rótulo</span>
            </Button>
          </div>
        </DialogHeader>

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* RÓTULO DE ENVÍO FÍSICO                                             */}
        {/* ═════════════════════════════════════════════════════════════════ */}
        <div className="pt-2">
          <div
            id="shipping-label-printable"
            ref={labelRef}
            className="bg-white text-black border-2 border-black rounded-xl p-5 shadow-xs font-sans text-xs space-y-3.5"
          >
            {/* Header del Rótulo: iubizon + Tracking + Barcode */}
            <div className="border-b-2 border-black pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xl tracking-tight text-[#f25c05]">
                      iubi<span className="text-black">zon</span>
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-1.5 py-0.5 rounded">
                      LOGÍSTICA
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-bold text-slate-700">
                    ORDEN: <span className="font-black text-black">#{data.orderCode}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-black text-white font-black text-xs px-3 py-1 rounded">
                    BULTO {data.packageNumber} DE {data.totalPackages}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-600 mt-1">
                    Emisión: {formatDate(data.createdAt)}
                  </span>
                </div>
              </div>

              {/* Barcode SVG centrado con Tracking ID */}
              <div className="mt-3 pt-2 border-t border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 p-2 rounded-lg">
                <Barcode
                  value={data.trackingId}
                  height={48}
                  showText={true}
                  className="w-full max-w-sm"
                />
              </div>
            </div>

            {/* SECCIÓN 1: DESTINATARIO (DESTINO) - Prioritario */}
            <div className="border-2 border-black rounded-lg p-3 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between border-b border-black/30 pb-1">
                <span className="font-black text-[11px] tracking-wider uppercase flex items-center gap-1.5 text-black">
                  <User className="w-3.5 h-3.5" />
                  <span>DESTINATARIO (ENTREGAR A:)</span>
                </span>
                {data.buyerDocumentNumber && (
                  <span className="font-mono font-bold text-xs">
                    {data.buyerDocumentType || "DOC"}: {data.buyerDocumentNumber}
                  </span>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-black text-sm text-black">
                  {data.buyerName.toUpperCase()}
                </div>

                {data.buyerPhone && (
                  <div className="font-bold text-xs flex items-center gap-1 text-black">
                    <Phone className="w-3.5 h-3.5" />
                    <span>TELÉFONO: {data.buyerPhone}</span>
                  </div>
                )}

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Dirección de Entrega / Agencia:
                  </span>
                  <p className="font-extrabold text-xs text-black leading-snug">
                    {data.destinationAddress || "Por coordinar con comprador"}
                  </p>
                </div>

                {destinationCity && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">
                      Destino (Distrito - Prov - Dpto):
                    </span>
                    <p className="font-black text-xs text-black">
                      {destinationCity.toUpperCase()}
                    </p>
                  </div>
                )}

                {data.destinationReference && (
                  <div className="pt-0.5">
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">
                      Referencia:
                    </span>
                    <p className="font-medium text-[11px] text-slate-800 italic">
                      {data.destinationReference}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 2: REMITENTE (ORIGEN) */}
            <div className="border border-black rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="font-black text-[10px] tracking-wider uppercase flex items-center gap-1 text-slate-800">
                  <Building2 className="w-3 h-3" />
                  <span>REMITENTE (TIENDA VENDEDORA)</span>
                </span>
                {data.companyTaxId && (
                  <span className="font-mono font-bold text-[11px] text-slate-700">
                    RUC: {data.companyTaxId}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-bold text-black block">
                    {data.companyLegalName || data.companyName}
                  </span>
                  {data.companyLocation && (
                    <span className="text-[11px] text-slate-600 block">
                      {data.companyLocation}
                    </span>
                  )}
                </div>

                {data.companyPhone && (
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-slate-600 uppercase block">
                      Contacto:
                    </span>
                    <span className="font-bold text-black text-xs">
                      {data.companyPhone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN 3: DETALLE DE TRANSPORTE Y CONTENIDO */}
            <div className="border border-black rounded-lg p-2.5 space-y-2">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-1.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Transporte / Courier:
                  </span>
                  <span className="font-black text-xs text-black uppercase">
                    {data.courier || "Movilidad Propia"}
                  </span>
                </div>

                {data.carrierTrackingNumber &&
                  data.carrierTrackingNumber !== data.trackingId && (
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-600 uppercase block">
                        Guía Transportista:
                      </span>
                      <span className="font-mono font-black text-xs text-black">
                        {data.carrierTrackingNumber}
                      </span>
                    </div>
                  )}
              </div>

              {/* Lista de Productos en el Bulto */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase">
                  <span>Contenido Declarado del Bulto:</span>
                  <span>Total: {totalUnits} un.</span>
                </div>
                <div className="space-y-0.5">
                  {data.items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100 last:border-0 font-medium"
                    >
                      <span className="truncate pr-2 font-bold text-black">
                        • {item.title}
                      </span>
                      <span className="font-black font-mono text-black shrink-0">
                        x{item.quantity} un.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer del Rótulo: Indicaciones */}
            <div className="border-t-2 border-black pt-2 flex items-center justify-between text-[9px] font-bold text-slate-700 uppercase tracking-wider">
              <span>⚠ PEGAR EN LUGAR VISIBLE DEL PAQUETE</span>
              <span>IUBIZON MARKETPLACE</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Cerrar
          </Button>

          <Button
            type="button"
            onClick={handlePrint}
            className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Rótulo (PDF / Papel)</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
