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
  AlertCircle,
  Boxes,
  Calendar,
  Car,
  CheckCircle,
  Link as LinkIcon,
  Loader2,
  Package,
  Phone,
  Plus,
  Trash2,
  Truck,
  User,
} from "lucide-react";

export interface DispatchItem {
  id: string;
  productId?: string;
  title: string;
  quantity: number;
  price?: number;
  image?: string | null;
}

export interface SplitShipmentState {
  id: string;
  courier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  carrierPhone: string;
  trackingUrl: string;
  isOwnTransport: boolean;
  driverName: string;
  vehiclePlate: string;
  itemAllocations: Record<string, number>;
}

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  items?: DispatchItem[];
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

type DispatchFormValues = z.infer<typeof dispatchFormSchema>;

export function DispatchModal({
  isOpen,
  onClose,
  packageId,
  items = [],
  currentCarrierName,
  currentTrackingNumber,
  currentEstimatedDelivery,
  currentCarrierPhone,
  currentTrackingUrl,
  onSuccess,
}: DispatchModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingMulti, setIsSubmittingMulti] = useState(false);

  const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
  const canSplit = totalUnits > 1 || items.length > 1;
  const [dispatchMode, setDispatchMode] = useState<"single" | "split">("single");

  const [shipments, setShipments] = useState<SplitShipmentState[]>([]);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      const firstAllocations: Record<string, number> = {};
      const secondAllocations: Record<string, number> = {};

      items.forEach((item) => {
        const qty = item.quantity || 1;
        if (qty > 1) {
          const half = Math.ceil(qty / 2);
          firstAllocations[item.id] = half;
          secondAllocations[item.id] = qty - half;
        } else {
          firstAllocations[item.id] = 1;
          secondAllocations[item.id] = 0;
        }
      });

      setShipments([
        {
          id: "bulto-1",
          courier: currentCarrierName || "Shalom",
          trackingNumber: currentTrackingNumber || "",
          estimatedDelivery: formatDateForInput(currentEstimatedDelivery) || "",
          carrierPhone: currentCarrierPhone || "",
          trackingUrl: currentTrackingUrl || "",
          isOwnTransport: false,
          driverName: "",
          vehiclePlate: "",
          itemAllocations: firstAllocations,
        },
        {
          id: "bulto-2",
          courier: currentCarrierName || "Shalom",
          trackingNumber: "",
          estimatedDelivery: formatDateForInput(currentEstimatedDelivery) || "",
          carrierPhone: currentCarrierPhone || "",
          trackingUrl: "",
          isOwnTransport: false,
          driverName: "",
          vehiclePlate: "",
          itemAllocations: secondAllocations,
        },
      ]);
    }
  }, [
    isOpen,
    items,
    currentCarrierName,
    currentTrackingNumber,
    currentEstimatedDelivery,
    currentCarrierPhone,
    currentTrackingUrl,
  ]);

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
        currentCarrierName?.toLowerCase().includes("propia"),
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
        currentCarrierName?.toLowerCase().includes("propia"),
      );
      reset({
        isOwnTransport: isPropia,
        carrierName: isPropia ? "Movilidad Propia" : (currentCarrierName ?? ""),
        trackingNumber: currentTrackingNumber ?? "",
        estimatedDelivery: formatDateForInput(currentEstimatedDelivery) ?? "",
        carrierPhone: currentCarrierPhone ?? "",
        driverName: "",
        vehiclePlate: "",
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

  const itemAllocatedTotals: Record<string, number> = {};
  items.forEach((it) => {
    itemAllocatedTotals[it.id] = shipments.reduce(
      (sum, sh) => sum + (sh.itemAllocations[it.id] || 0),
      0,
    );
  });

  const isAllAllocatedCorrectly = items.every(
    (it) => itemAllocatedTotals[it.id] === (it.quantity || 1),
  );

  const handleAddShipment = () => {
    const newAllocations: Record<string, number> = {};
    items.forEach((item) => {
      const remaining =
        (item.quantity || 1) - (itemAllocatedTotals[item.id] || 0);
      newAllocations[item.id] = Math.max(0, remaining);
    });

    setShipments((prev) => [
      ...prev,
      {
        id: `bulto-${prev.length + 1}`,
        courier: currentCarrierName || "Shalom",
        trackingNumber: "",
        estimatedDelivery: formatDateForInput(currentEstimatedDelivery) || "",
        carrierPhone: currentCarrierPhone || "",
        trackingUrl: "",
        isOwnTransport: false,
        driverName: "",
        vehiclePlate: "",
        itemAllocations: newAllocations,
      },
    ]);
  };

  const handleRemoveShipment = (index: number) => {
    if (shipments.length <= 2) return;
    setShipments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateShipmentField = (
    index: number,
    field: keyof SplitShipmentState,
    val: any,
  ) => {
    setShipments((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleUpdateAllocation = (
    shipmentIndex: number,
    itemId: string,
    qty: number,
  ) => {
    setShipments((prev) => {
      const copy = [...prev];
      const newAlloc = { ...copy[shipmentIndex].itemAllocations };
      newAlloc[itemId] = Math.max(0, qty);
      copy[shipmentIndex] = {
        ...copy[shipmentIndex],
        itemAllocations: newAlloc,
      };
      return copy;
    });
  };

  const onSubmitSingle = async (values: DispatchFormValues) => {
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

      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          action: "mark_shipped",
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

  const onSubmitSplit = async () => {
    try {
      setError(null);
      setIsSubmittingMulti(true);

      for (let i = 0; i < shipments.length; i++) {
        const sh = shipments[i];
        const bultoLabel = `Bulto ${i + 1}`;

        if (!sh.isOwnTransport && !sh.courier.trim()) {
          throw new Error(
            `Ingresa la empresa de transporte para ${bultoLabel}.`,
          );
        }
        if (!sh.isOwnTransport && !sh.trackingNumber.trim()) {
          throw new Error(
            `Ingresa el número de guía / tracking para ${bultoLabel}.`,
          );
        }
        if (sh.isOwnTransport && !sh.carrierPhone.trim()) {
          throw new Error(
            `Ingresa el teléfono del transportista para ${bultoLabel}.`,
          );
        }
        if (!sh.estimatedDelivery) {
          throw new Error(
            `Ingresa la fecha estimada de llegada para ${bultoLabel}.`,
          );
        }

        const totalItemsInBulto = Object.values(sh.itemAllocations).reduce(
          (a, b) => a + b,
          0,
        );
        if (totalItemsInBulto === 0) {
          throw new Error(`El ${bultoLabel} no tiene productos asignados.`);
        }
      }

      if (!isAllAllocatedCorrectly) {
        throw new Error(
          "La suma de unidades asignadas en los bultos no coincide con el total de la orden.",
        );
      }

      const formattedShipments = shipments.map((sh) => {
        let finalTracking = sh.isOwnTransport
          ? "Movilidad Propia"
          : sh.trackingNumber.trim();

        if (sh.isOwnTransport) {
          const details: string[] = [];
          if (sh.driverName.trim())
            details.push(`Conductor: ${sh.driverName.trim()}`);
          if (sh.vehiclePlate.trim())
            details.push(`Placa: ${sh.vehiclePlate.trim()}`);
          if (details.length > 0)
            finalTracking = `Movilidad Propia (${details.join(" | ")})`;
        }

        return {
          courier: sh.isOwnTransport ? "Movilidad Propia" : sh.courier.trim(),
          trackingNumber: finalTracking,
          trackingUrl: sh.isOwnTransport
            ? undefined
            : sh.trackingUrl.trim() || undefined,
          carrierPhone: sh.carrierPhone.trim() || undefined,
          estimatedDelivery: sh.estimatedDelivery,
          items: Object.entries(sh.itemAllocations)
            .filter(([_, qty]) => qty > 0)
            .map(([itemId, qty]) => ({ id: itemId, quantity: qty })),
        };
      });

      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          action: "mark_shipped",
          shipments: formattedShipments,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error || "Error al registrar despachos fraccionados",
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar despachos",
      );
    } finally {
      setIsSubmittingMulti(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className={`bg-white rounded-3xl p-6 border border-[#e2e8f0] ${
          dispatchMode === "split"
            ? "max-w-2xl max-h-[90vh] overflow-y-auto"
            : "max-w-md"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-[#112237] flex items-center justify-between">
            <span>Confirmar Despacho del Pedido</span>
            {canSplit && (
              <span className="text-[11px] font-bold text-[#f25c05] bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200">
                {totalUnits} unidades totales
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Selector de Modalidad (1 solo paquete vs Múltiples Bultos eBay style) */}
        {canSplit && (
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setDispatchMode("single")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                dispatchMode === "single"
                  ? "bg-white text-[#112237] shadow-xs"
                  : "text-slate-500 hover:text-[#112237]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>1 Solo Paquete</span>
            </button>
            <button
              type="button"
              onClick={() => setDispatchMode("split")}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                dispatchMode === "split"
                  ? "bg-[#f25c05] text-white shadow-xs"
                  : "text-slate-500 hover:text-[#112237]"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Múltiples Bultos (eBay)</span>
            </button>
          </div>
        )}

        {/* MODO 1: Despacho Único */}
        {dispatchMode === "single" ? (
          <form
            onSubmit={handleSubmit(onSubmitSingle)}
            className="space-y-4 pt-1"
          >
            <p className="text-xs text-[#64748b]">
              Selecciona el método de transporte e ingresa los datos de la guía
              para notificar al comprador.
            </p>

            {/* Opción Movilidad Propia */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-orange-50/70 border border-orange-200/80">
              <input
                type="checkbox"
                id="isOwnTransport"
                className="w-4 h-4 rounded border-slate-300 text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
                {...register("isOwnTransport")}
              />
              <label
                htmlFor="isOwnTransport"
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
                placeholder="Ej: Shalom Courier, Olva Courier, Marvisur"
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
                  className="text-xs font-mono font-bold"
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
                      className="text-xs pl-9 font-mono"
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
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-5 rounded-xl shadow-sm cursor-pointer"
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
        ) : (
          /* MODO 2: Despacho en Múltiples Bultos (eBay) */
          <div className="space-y-5 pt-1">
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                isAllAllocatedCorrectly
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              <div>
                <span className="font-bold block">
                  {isAllAllocatedCorrectly
                    ? "✓ Todos los productos fueron asignados a los bultos"
                    : "⚠️ Distribuye el total de unidades compradas entre los bultos"}
                </span>
                <span className="text-[11px] opacity-80">
                  {items.map((it) => (
                    <span key={it.id} className="mr-3">
                      {it.title}: {itemAllocatedTotals[it.id] || 0} de{" "}
                      {it.quantity || 1} un.
                    </span>
                  ))}
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddShipment}
                className="bg-white text-xs font-bold border-slate-300 rounded-xl h-8 px-3 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#f25c05]" />
                <span>Agregar Bulto</span>
              </Button>
            </div>

            <div className="space-y-4">
              {shipments.map((sh, sIdx) => {
                const bultoNumber = sIdx + 1;
                const totalInThisBulto = Object.values(
                  sh.itemAllocations,
                ).reduce((a, b) => a + b, 0);

                return (
                  <div
                    key={sh.id}
                    className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-3.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#f25c05] text-white font-black text-xs flex items-center justify-center">
                          {bultoNumber}
                        </span>
                        <span className="font-extrabold text-xs text-[#112237]">
                          Información de Envío ({bultoNumber} de{" "}
                          {shipments.length})
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          {totalInThisBulto} un.
                        </span>
                      </div>

                      {shipments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveShipment(sIdx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Eliminar este bulto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Productos en este bulto:
                      </span>
                      <div className="space-y-2">
                        {items.map((it) => (
                          <div
                            key={it.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="font-bold text-[#112237] truncate flex-1">
                              {it.title}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-slate-400">
                                de {it.quantity || 1} un.
                              </span>
                              <div className="flex items-center gap-1">
                                <Label className="text-[10px] text-slate-500 font-bold">
                                  Cant:
                                </Label>
                                <Input
                                  type="number"
                                  min={0}
                                  max={it.quantity || 1}
                                  value={sh.itemAllocations[it.id] ?? 0}
                                  onChange={(e) =>
                                    handleUpdateAllocation(
                                      sIdx,
                                      it.id,
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-16 h-8 text-center text-xs font-bold"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-[#112237]">
                          Transporte *
                        </Label>
                        <Input
                          placeholder="Ej: Shalom, Olva"
                          value={sh.courier}
                          onChange={(e) =>
                            handleUpdateShipmentField(
                              sIdx,
                              "courier",
                              e.target.value,
                            )
                          }
                          className="text-xs h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-[#112237]">
                          N° de Guía / Tracking *
                        </Label>
                        <Input
                          placeholder="Ej: 1Z14V5340..."
                          value={sh.trackingNumber}
                          onChange={(e) =>
                            handleUpdateShipmentField(
                              sIdx,
                              "trackingNumber",
                              e.target.value,
                            )
                          }
                          className="text-xs font-mono font-bold h-8"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-[#112237]">
                          Llegada Estimada *
                        </Label>
                        <Input
                          type="datetime-local"
                          value={sh.estimatedDelivery}
                          onChange={(e) =>
                            handleUpdateShipmentField(
                              sIdx,
                              "estimatedDelivery",
                              e.target.value,
                            )
                          }
                          className="text-xs h-8 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmittingMulti}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onSubmitSplit}
                disabled={isSubmittingMulti || !isAllAllocatedCorrectly}
                className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-5 rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmittingMulti ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Guardando Bultos...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    <span>Guardar {shipments.length} Bultos</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
