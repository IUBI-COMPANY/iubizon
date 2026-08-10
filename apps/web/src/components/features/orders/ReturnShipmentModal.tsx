"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

interface ReturnShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundId: string;
  onSuccess: () => void;
}

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 16);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return dateStr.slice(0, 16);
  }
}

const returnShipmentSchema = z.object({
  carrierName: z
    .string()
    .trim()
    .min(1, "La empresa de transporte es obligatoria."),
  trackingNumber: z
    .string()
    .trim()
    .min(1, "El número de seguimiento / guía es obligatorio."),
  estimatedDelivery: z
    .string()
    .min(1, "La fecha estimada de llegada es obligatoria."),
  carrierPhone: z.string().optional(),
  trackingUrl: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\//.test(val), {
      message: "Ingresa una URL válida (debe iniciar con http:// o https://).",
    }),
});

type ReturnShipmentFormValues = z.infer<typeof returnShipmentSchema>;

export function ReturnShipmentModal({
  isOpen,
  onClose,
  refundId,
  onSuccess,
}: ReturnShipmentModalProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReturnShipmentFormValues>({
    resolver: zodResolver(returnShipmentSchema),
    defaultValues: {
      carrierName: "",
      trackingNumber: "",
      estimatedDelivery: "",
      carrierPhone: "",
      trackingUrl: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        carrierName: "",
        trackingNumber: "",
        estimatedDelivery: "",
        carrierPhone: "",
        trackingUrl: "",
      });
      setError(null);
    }
  }, [isOpen, reset]);

  const onSubmit = async (values: ReturnShipmentFormValues) => {
    try {
      setError(null);

      const res = await fetch("/api/orders/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refundId,
          action: "register_return",
          buyerReturnTracking: values.trackingNumber.trim(),
          returnCourier: values.carrierName.trim(),
          returnEstimatedDelivery: values.estimatedDelivery,
          returnCarrierPhone: values.carrierPhone?.trim() || null,
          returnTrackingUrl: values.trackingUrl?.trim() || null,
        }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch {
        throw new Error(resText || "Error al conectar con el servidor");
      }
      if (!res.ok) {
        throw new Error(
          data.error || "Error al registrar el envío de devolución",
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al guardar envío de devolución",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#e2e8f0]">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-[#112237]">
            Confirmar Envío de Devolución
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-[#64748b]">
            Ingresa la información proporcionada por la agencia de transporte al
            momento de realizar el envío de vuelta al vendedor.
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
              className="text-xs"
              {...register("carrierName")}
            />
            {errors.carrierName && (
              <p className="text-xs text-red-500 font-medium">
                {errors.carrierName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Tracking ID / Número de Guía *
            </Label>
            <Input
              placeholder="Ej: SHA-9842104"
              className="text-xs"
              {...register("trackingNumber")}
            />
            {errors.trackingNumber && (
              <p className="text-xs text-red-500 font-medium">
                {errors.trackingNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 w-full">
            <Label className="text-xs font-bold text-[#112237]">
              Fecha y Hora Estimada de Llegada *
            </Label>
            <div className="relative w-full">
              <Input
                type="datetime-local"
                className="w-full text-xs pl-3.5 pr-10 cursor-pointer font-medium text-[#112237] rounded-xl [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                {...register("estimatedDelivery")}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.estimatedDelivery && (
              <p className="text-xs text-red-500 font-medium">
                {errors.estimatedDelivery.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Teléfono del Transportista
            </Label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="Ej: 987654321"
                className="text-xs pl-9"
                {...register("carrierPhone")}
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Link de Seguimiento de la Agencia
            </Label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://shalom.pe/rastreo/..."
                className="text-xs pl-9"
                {...register("trackingUrl")}
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            {errors.trackingUrl && (
              <p className="text-xs text-red-500 font-medium">
                {errors.trackingUrl.message}
              </p>
            )}
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
                  <span>Guardar Envío</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
