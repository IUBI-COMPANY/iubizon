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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface AdminDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  orderCode?: string;
  buyerName?: string;
  destinationAddress?: string;
  currentCarrierName?: string | null;
  currentTrackingNumber?: string | null;
  currentEstimatedDelivery?: string | null;
  currentCarrierPhone?: string | null;
  currentTrackingUrl?: string | null;
  onSuccess: () => void;
}

function formatDateForInput(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 16);
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return dateStr.slice(0, 16);
  }
}

function extractDriverAndPlate(trackingStr?: string | null): {
  driverName: string;
  vehiclePlate: string;
} {
  if (!trackingStr) return { driverName: "", vehiclePlate: "" };
  const driverMatch = trackingStr.match(/Conductor:\s*([^|)]+)/i);
  const plateMatch = trackingStr.match(/Placa:\s*([^|)]+)/i);
  return {
    driverName: driverMatch ? driverMatch[1].trim() : "",
    vehiclePlate: plateMatch ? plateMatch[1].trim() : "",
  };
}

const dispatchFormSchema = z
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
        message:
          "Ingresa una URL válida (debe iniciar con http:// o https://).",
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

type DispatchFormValues = z.infer<typeof dispatchFormSchema>;

export function AdminDispatchModal({
  isOpen,
  onClose,
  packageId,
  orderCode,
  buyerName,
  destinationAddress,
  currentCarrierName,
  currentTrackingNumber,
  currentEstimatedDelivery,
  currentCarrierPhone,
  currentTrackingUrl,
  onSuccess,
}: AdminDispatchModalProps) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DispatchFormValues>({
    resolver: zodResolver(dispatchFormSchema),
    defaultValues: {
      isOwnTransport: Boolean(
        currentCarrierName?.toLowerCase().includes("propia") ||
        currentTrackingNumber?.toLowerCase().includes("propia"),
      ),
      carrierName: currentCarrierName ?? "",
      trackingNumber: currentTrackingNumber ?? "",
      estimatedDelivery: formatDateForInput(currentEstimatedDelivery) ?? "",
      carrierPhone: currentCarrierPhone ?? "",
      driverName: "",
      vehiclePlate: "",
      trackingUrl: currentTrackingUrl ?? "",
    },
  });

  const isOwnTransport = watch("isOwnTransport");

  useEffect(() => {
    if (isOpen) {
      const isPropia = Boolean(
        currentCarrierName?.toLowerCase().includes("propia") ||
        currentTrackingNumber?.toLowerCase().includes("propia"),
      );
      const { driverName, vehiclePlate } = extractDriverAndPlate(
        currentTrackingNumber,
      );

      reset({
        isOwnTransport: isPropia,
        carrierName: isPropia ? "Movilidad Propia" : (currentCarrierName ?? ""),
        trackingNumber: isPropia
          ? "Movilidad Propia"
          : (currentTrackingNumber ?? ""),
        estimatedDelivery: formatDateForInput(currentEstimatedDelivery) ?? "",
        carrierPhone: currentCarrierPhone ?? "",
        driverName,
        vehiclePlate,
        trackingUrl: currentTrackingUrl ?? "",
      });
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
    reset,
  ]);

  useEffect(() => {
    if (isOwnTransport) {
      setValue("carrierName", "Movilidad Propia");
      if (!watch("trackingNumber")) {
        setValue("trackingNumber", "Movilidad Propia");
      }
    } else {
      if (watch("carrierName") === "Movilidad Propia") {
        setValue("carrierName", currentCarrierName ?? "");
      }
      if (watch("trackingNumber") === "Movilidad Propia") {
        setValue("trackingNumber", currentTrackingNumber ?? "");
      }
    }
  }, [
    isOwnTransport,
    setValue,
    watch,
    currentCarrierName,
    currentTrackingNumber,
  ]);

  const onSubmit = async (values: DispatchFormValues) => {
    try {
      setError(null);

      const isOwn = values.isOwnTransport;
      const finalCourier = isOwn
        ? "Movilidad Propia"
        : values.carrierName?.trim() || "Empresa de Transporte";

      let finalTracking = isOwn
        ? "Movilidad Propia"
        : values.trackingNumber?.trim() || "DESPACHO-DIRECTO";

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

      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updatePackageDispatch",
          packageId,
          status: "shipped",
          courier: finalCourier,
          trackingNumber: finalTracking,
          estimatedDelivery: values.estimatedDelivery,
          carrierPhone: values.carrierPhone?.trim() || undefined,
          trackingUrl: isOwn
            ? undefined
            : values.trackingUrl?.trim() || undefined,
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md bg-white rounded-3xl p-6 border border-[#e2e8f0]"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-[#112237]">
            Confirmar Despacho del Pedido #{orderCode || packageId.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-[#64748b]">
            Selecciona el método de transporte e ingresa los datos
            correspondientes para notificar al comprador (
            {buyerName || "Cliente"}).
          </p>

          {buyerName && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1">
              <p>
                <strong>Destinatario:</strong> {buyerName}
              </p>
              {destinationAddress && (
                <p className="text-slate-600">
                  <strong>Dirección:</strong> {destinationAddress}
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* Opción Movilidad Propia */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
            <input
              type="checkbox"
              id="isOwnTransportAdmin"
              className="w-4 h-4 rounded border-slate-300 text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
              {...register("isOwnTransport")}
            />
            <label
              htmlFor="isOwnTransportAdmin"
              className="text-xs font-bold text-[#112237] cursor-pointer select-none flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4 text-[#f25c05]" />
              Tengo movilidad propia / Despacho directo
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-[#112237]">
              Empresa de Transporte *
            </Label>
            <Input
              placeholder="Ej: Shalom Courier, Olva Courier, Marvisur, iubizon Express"
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
          )}

          {isOwnTransport && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-[#112237]">
                  Nombre del Conductor
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
              Teléfono del Transportista / Conductor{" "}
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
