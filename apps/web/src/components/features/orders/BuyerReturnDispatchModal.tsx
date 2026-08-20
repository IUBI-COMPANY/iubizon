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
  Car,
  CheckCircle,
  Link as LinkIcon,
  Loader2,
  Phone,
  Truck,
  User,
} from "lucide-react";

interface BuyerReturnDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  refundRequestId: string;
  orderCode?: string;
  destinationAddress?: string;
  isConsolidated?: boolean;
  onSuccess: () => void;
}

const returnDispatchFormSchema = z
  .object({
    isOwnTransport: z.boolean(),
    carrierName: z.string(),
    trackingNumber: z.string(),
    estimatedDelivery: z
      .string()
      .min(1, "La fecha y hora estimada de llegada es obligatoria."),
    carrierPhone: z.string(),
    driverName: z.string(),
    vehiclePlate: z.string(),
    trackingUrl: z
      .string()
      .optional()
      .refine((val) => !val || /^https?:\/\//.test(val), {
        message: "Ingresa una URL válida (debe iniciar con http:// o https://).",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.isOwnTransport) {
      if (!data.carrierPhone || data.carrierPhone.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "El teléfono del transportista / conductor es obligatorio para movilidad propia.",
          path: ["carrierPhone"],
        });
      }
    } else {
      if (!data.carrierName || data.carrierName.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "La empresa de transporte es obligatoria.",
          path: ["carrierName"],
        });
      }
      if (!data.trackingNumber || data.trackingNumber.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "El número de seguimiento / guía es obligatorio.",
          path: ["trackingNumber"],
        });
      }
    }
  });

type ReturnDispatchFormValues = z.infer<typeof returnDispatchFormSchema>;

export function BuyerReturnDispatchModal({
  isOpen,
  onClose,
  refundRequestId,
  orderCode,
  destinationAddress,
  isConsolidated,
  onSuccess,
}: BuyerReturnDispatchModalProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReturnDispatchFormValues>({
    resolver: zodResolver(returnDispatchFormSchema),
    defaultValues: {
      isOwnTransport: false,
      carrierName: "",
      trackingNumber: "",
      estimatedDelivery: "",
      carrierPhone: "",
      driverName: "",
      vehiclePlate: "",
      trackingUrl: "",
    },
  });

  const isOwnTransport = watch("isOwnTransport");

  useEffect(() => {
    if (isOpen) {
      reset({
        isOwnTransport: false,
        carrierName: "",
        trackingNumber: "",
        estimatedDelivery: "",
        carrierPhone: "",
        driverName: "",
        vehiclePlate: "",
        trackingUrl: "",
      });
      setError(null);
    }
  }, [isOpen, refundRequestId, reset]);

  useEffect(() => {
    if (isOwnTransport) {
      setValue("carrierName", "Movilidad Propia");
      if (!watch("trackingNumber")) {
        setValue("trackingNumber", "Movilidad Propia");
      }
    } else {
      if (watch("carrierName") === "Movilidad Propia") {
        setValue("carrierName", "");
      }
      if (watch("trackingNumber") === "Movilidad Propia") {
        setValue("trackingNumber", "");
      }
    }
  }, [isOwnTransport, setValue, watch]);

  const onSubmit = async (values: ReturnDispatchFormValues) => {
    try {
      setError(null);

      const isOwn = values.isOwnTransport;
      const finalCourier = isOwn
        ? "Movilidad Propia"
        : values.carrierName?.trim() || "Empresa de Transporte";

      let finalTracking = isOwn
        ? "Movilidad Propia"
        : values.trackingNumber?.trim() || "RETORNO-DIRECTO";

      if (isOwn) {
        const details: string[] = [];
        if (values.driverName?.trim()) {
          details.push(`Conductor: ${values.driverName.trim()}`);
        }
        if (values.vehiclePlate?.trim()) {
          details.push(`Placa: ${values.vehiclePlate.trim()}`);
        }
        if (details.length > 0) {
          finalTracking = `Movilidad Propia (${details.join(" | ")})`;
        }
      }

      const res = await fetch("/api/orders/refund", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dispatch_return",
          refundRequestId,
          returnCourier: finalCourier,
          buyerReturnTracking: finalTracking,
          returnEstimatedDelivery: values.estimatedDelivery,
          returnCarrierPhone: values.carrierPhone?.trim() || undefined,
          returnTrackingUrl: isOwn
            ? undefined
            : values.trackingUrl?.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar el despacho de devolución");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar despacho de devolución",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white rounded-3xl p-6 border border-[#e2e8f0]">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-[#112237]">
            Registrar Despacho de Devolución {orderCode ? `— #${orderCode}` : ""}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          <p className="text-slate-600">
            {isConsolidated
              ? "Ingresa los datos del despacho del paquete de retorno hacia el Almacén Central de iubizon (Chorrillos)."
              : "Ingresa los datos del despacho del paquete de retorno hacia la tienda/almacén del vendedor."}
          </p>

          {destinationAddress && (
            <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-3 space-y-1">
              <span className="text-[9px] font-black text-[#f25c05] uppercase tracking-wider">
                {isConsolidated ? "Destino: Almacén Central iubizon" : "Destino: Dirección del Vendedor"}
              </span>
              <p className="text-slate-700 font-medium">{destinationAddress}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Opción Movilidad Propia */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
            <input
              type="checkbox"
              id="isOwnTransportReturn"
              className="w-4 h-4 rounded border-slate-300 text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
              {...register("isOwnTransport")}
            />
            <label
              htmlFor="isOwnTransportReturn"
              className="text-xs font-bold text-[#112237] cursor-pointer select-none flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-[#f25c05]" />
              Entregaré por movilidad propia / Entrega presencial
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Empresa de Transporte / Courier *
            </Label>
            <Input
              placeholder="Ej: Shalom, Olva Courier, Marvisur"
              className={`text-xs ${
                isOwnTransport
                  ? "bg-slate-100 font-semibold text-slate-700 cursor-not-allowed"
                  : ""
              }`}
              readOnly={isOwnTransport}
              {...register("carrierName")}
            />
            {errors.carrierName && (
              <p className="text-xs text-red-500 font-medium">
                {errors.carrierName.message}
              </p>
            )}
          </div>

          {!isOwnTransport && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112237]">
                Número de Guía / Tracking ID *
              </Label>
              <Input
                placeholder="Ej: SHA-129038"
                className="text-xs"
                {...register("trackingNumber")}
              />
              {errors.trackingNumber && (
                <p className="text-xs text-red-500 font-medium">
                  {errors.trackingNumber.message}
                </p>
              )}
            </div>
          )}

          {isOwnTransport && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112237]">
                  Nombre de quien entrega
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Ej: Carlos Gómez"
                    className="text-xs pl-9"
                    {...register("driverName")}
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112237]">
                  Placa del Vehículo
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Ej: ABC-123"
                    className="text-xs pl-9"
                    {...register("vehiclePlate")}
                  />
                  <Car className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          )}

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
              Teléfono de Contacto del Envió{" "}
              {isOwnTransport ? "*" : "(Opcional)"}
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
            {errors.carrierPhone && (
              <p className="text-xs text-red-500 font-medium">
                {errors.carrierPhone.message}
              </p>
            )}
          </div>

          {!isOwnTransport && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-[#112237]">
                Link de Rastreo de la Agencia (Opcional)
              </Label>
              <div className="relative">
                <Input
                  type="url"
                  placeholder="https://shalom.pe/..."
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
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs font-bold"
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
                  <span>Confirmar Despacho</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
