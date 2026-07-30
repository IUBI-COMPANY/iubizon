"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Calendar,
  CheckCircle,
  Link as LinkIcon,
  Loader2,
  Phone,
} from "lucide-react";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  currentCarrierName?: string | null;
  currentTrackingNumber?: string | null;
  currentEstimatedDelivery?: string | null;
  currentCarrierPhone?: string | null;
  currentTrackingUrl?: string | null;
  onSuccess: () => void;
}

export function DispatchModal({
  isOpen,
  onClose,
  packageId,
  currentCarrierName,
  currentTrackingNumber,
  currentEstimatedDelivery,
  currentCarrierPhone,
  currentTrackingUrl,
  onSuccess,
}: DispatchModalProps) {
  const [carrierName, setCarrierName] = useState(currentCarrierName || "");
  const [trackingNumber, setTrackingNumber] = useState(
    currentTrackingNumber || "",
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    currentEstimatedDelivery ? currentEstimatedDelivery.slice(0, 10) : "",
  );
  const [carrierPhone, setCarrierPhone] = useState(currentCarrierPhone || "");
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCarrierName(currentCarrierName || "");
      setTrackingNumber(currentTrackingNumber || "");
      setEstimatedDelivery(
        currentEstimatedDelivery ? currentEstimatedDelivery.slice(0, 10) : "",
      );
      setCarrierPhone(currentCarrierPhone || "");
      setTrackingUrl(currentTrackingUrl || "");
      setError(null);
    }
  }, [
    isOpen,
    packageId,
    currentCarrierName,
    currentTrackingNumber,
    currentEstimatedDelivery,
    currentCarrierPhone,
    currentTrackingUrl,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrierName.trim() || !trackingNumber.trim() || !estimatedDelivery) {
      setError(
        "Por favor completa la empresa de transporte, el número de seguimiento y la fecha estimada.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          action: "dispatch",
          carrierName: carrierName.trim(),
          trackingNumber: trackingNumber.trim(),
          estimatedDelivery,
          carrierPhone: carrierPhone.trim() || undefined,
          trackingUrl: trackingUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar el despacho");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar despacho",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#e2e8f0]">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-[#112237]">
            Confirmar Despacho del Pedido
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-[#64748b]">
            Ingresa la información proporcionada por la agencia de transporte al
            momento de realizar el envío.
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Empresa de Transporte *
            </Label>
            <Input
              placeholder="Ej: Shalom Courier, Olva Courier, Marvisur"
              value={carrierName}
              onChange={(e) => setCarrierName(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Tracking ID / Número de Guía *
            </Label>
            <Input
              placeholder="Ej: SHA-9842104"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Fecha Estimada de Llegada *
            </Label>
            <div className="relative">
              <Input
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                className="text-xs"
                required
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Teléfono del Transportista (Opcional)
            </Label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="Ej: 987654321"
                value={carrierPhone}
                onChange={(e) => setCarrierPhone(e.target.value)}
                className="text-xs pl-9"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Link de Seguimiento de la Agencia (Opcional)
            </Label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://shalom.pe/rastreo/..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="text-xs pl-9"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-5 rounded-xl shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span>Guardar Despacho</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
