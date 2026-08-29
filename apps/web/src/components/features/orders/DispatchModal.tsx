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
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import {
  AlertCircle,
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

import {
  isOwnMobilityCourier,
  formatDateForDatetimeInput,
  formatMovilidadPropiaTracking,
} from "@/lib/utils/tracking";

export interface DispatchItem {
  id: string;
  productId?: string;
  title: string;
  quantity: number;
  price?: number;
  image?: string | null;
}

export interface BultoShipmentState {
  id: string;
  isOwnTransport: boolean;
  courier: string;
  trackingNumber: string;
  driverName: string;
  vehiclePlate: string;
  estimatedDelivery: string;
  carrierPhone: string;
  trackingUrl: string;
  itemAllocations: Record<string, number>;
}

export interface InitialShipmentData {
  packageId?: string;
  courier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrierPhone?: string | null;
  estimatedDelivery?: string | null;
  items?: Array<{ id?: string; productId?: string; quantity: number }>;
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
  initialShipments?: InitialShipmentData[];
  onSuccess: () => void;
}

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
  initialShipments,
  onSuccess,
}: DispatchModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipments, setShipments] = useState<BultoShipmentState[]>([]);

  const totalUnits = items.reduce((acc, i) => acc + (i.quantity || 1), 0);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      if (initialShipments && initialShipments.length > 0) {
        const mapped: BultoShipmentState[] = initialShipments.map((sh, idx) => {
          const isPropia = isOwnMobilityCourier(sh.courier);
          const allocations: Record<string, number> = {};

          if (sh.items && Array.isArray(sh.items)) {
            sh.items.forEach((it) => {
              const matchedItem = items.find(
                (item) =>
                  item.id === it.id ||
                  item.productId === it.productId ||
                  item.productId === it.id ||
                  item.id === it.productId,
              );
              if (matchedItem) {
                allocations[matchedItem.id] =
                  (allocations[matchedItem.id] || 0) + (it.quantity || 1);
              }
            });
          }

          return {
            id: `bulto-${idx + 1}`,
            isOwnTransport: isPropia,
            courier: isPropia ? "Movilidad Propia" : sh.courier || "Shalom",
            trackingNumber: sh.trackingNumber || "",
            driverName: "",
            vehiclePlate: "",
            estimatedDelivery:
              formatDateForDatetimeInput(sh.estimatedDelivery) || "",
            carrierPhone: sh.carrierPhone || "",
            trackingUrl: sh.trackingUrl || "",
            itemAllocations: allocations,
          };
        });

        setShipments(mapped);
      } else {
        const initialAllocations: Record<string, number> = {};
        items.forEach((item) => {
          initialAllocations[item.id] = item.quantity || 1;
        });

        const isPropia = isOwnMobilityCourier(currentCarrierName);

        setShipments([
          {
            id: "bulto-1",
            isOwnTransport: isPropia,
            courier: isPropia
              ? "Movilidad Propia"
              : currentCarrierName || "Shalom",
            trackingNumber: currentTrackingNumber || "",
            driverName: "",
            vehiclePlate: "",
            estimatedDelivery:
              formatDateForDatetimeInput(currentEstimatedDelivery) || "",
            carrierPhone: currentCarrierPhone || "",
            trackingUrl: currentTrackingUrl || "",
            itemAllocations: initialAllocations,
          },
        ]);
      }
      setError(null);
    }
  }, [
    isOpen,
    items,
    currentCarrierName,
    currentTrackingNumber,
    currentEstimatedDelivery,
    currentCarrierPhone,
    currentTrackingUrl,
    initialShipments,
  ]);

  const itemAllocatedTotals: Record<string, number> = {};
  items.forEach((it) => {
    itemAllocatedTotals[it.id] = shipments.reduce(
      (sum, sh) => sum + (sh.itemAllocations[it.id] || 0),
      0,
    );
  });

  const isAllAllocatedCorrectly =
    items.length > 0 &&
    items.every((it) => itemAllocatedTotals[it.id] === (it.quantity || 1));

  const bultoValidations = shipments.map((sh, idx) => {
    const bultoLabel =
      shipments.length > 1 ? `Bulto ${idx + 1}` : "El despacho";
    const totalItemsInBulto = Object.values(sh.itemAllocations).reduce(
      (a, b) => a + b,
      0,
    );

    const issues: string[] = [];
    if (totalItemsInBulto === 0) {
      issues.push("No tiene productos asignados");
    }

    if (sh.isOwnTransport) {
      if (!sh.carrierPhone?.trim()) {
        issues.push("Falta teléfono del conductor");
      }
      if (!sh.estimatedDelivery?.trim()) {
        issues.push("Falta fecha estimada de llegada");
      }
    } else {
      if (!sh.courier?.trim()) {
        issues.push("Falta empresa de transporte");
      }
      if (!sh.trackingNumber?.trim()) {
        issues.push("Falta número de guía / tracking");
      }
      if (!sh.estimatedDelivery?.trim()) {
        issues.push("Falta fecha estimada de llegada");
      }
    }

    return {
      index: idx,
      bultoLabel,
      totalItemsInBulto,
      issues,
      isValid: issues.length === 0,
    };
  });

  const hasAnyBultoIssue = bultoValidations.some((v) => !v.isValid);
  const canSubmit =
    isAllAllocatedCorrectly && !hasAnyBultoIssue && !isSubmitting;

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
        id: `bulto-${prev.length + 1}-${Date.now()}`,
        isOwnTransport: false,
        courier: "Shalom",
        trackingNumber: "",
        driverName: "",
        vehiclePlate: "",
        estimatedDelivery:
          formatDateForDatetimeInput(currentEstimatedDelivery) || "",
        carrierPhone: currentCarrierPhone || "",
        trackingUrl: "",
        itemAllocations: newAllocations,
      },
    ]);
  };

  const handleRemoveShipment = (index: number) => {
    if (shipments.length <= 1) return;
    setShipments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateShipmentField = (
    index: number,
    field: keyof BultoShipmentState,
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
    const item = items.find((it) => it.id === itemId);
    if (!item) return;

    const totalOrderQty = item.quantity || 1;

    const otherBultosSum = shipments.reduce((sum, sh, idx) => {
      if (idx === shipmentIndex) return sum;
      return sum + (sh.itemAllocations[itemId] || 0);
    }, 0);

    const maxAllowedForThis = Math.max(0, totalOrderQty - otherBultosSum);
    const clampedQty = Math.min(maxAllowedForThis, Math.max(0, qty));

    setShipments((prev) => {
      const copy = [...prev];
      const newAlloc = { ...copy[shipmentIndex].itemAllocations };
      newAlloc[itemId] = clampedQty;
      copy[shipmentIndex] = {
        ...copy[shipmentIndex],
        itemAllocations: newAlloc,
      };
      return copy;
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);

      if (shipments.length === 0) {
        throw new Error("Debes registrar al menos 1 bulto de despacho.");
      }

      for (let i = 0; i < shipments.length; i++) {
        const sh = shipments[i];
        const val = bultoValidations[i];

        if (val.totalItemsInBulto === 0) {
          throw new Error(
            `El ${val.bultoLabel} no tiene productos asignados. Agrega al menos 1 unidad o elimina la guía.`,
          );
        }

        if (sh.isOwnTransport) {
          if (!sh.carrierPhone || !sh.carrierPhone.trim()) {
            throw new Error(
              `Ingresa el teléfono del conductor / transportista para ${val.bultoLabel}.`,
            );
          }
        } else {
          if (!sh.courier || !sh.courier.trim()) {
            throw new Error(
              `Ingresa la empresa de transporte para ${val.bultoLabel}.`,
            );
          }
          if (!sh.trackingNumber || !sh.trackingNumber.trim()) {
            throw new Error(
              `Ingresa el número de guía / tracking para ${val.bultoLabel}.`,
            );
          }
        }

        if (!sh.estimatedDelivery || !sh.estimatedDelivery.trim()) {
          throw new Error(
            `Ingresa la fecha y hora estimada de llegada para ${val.bultoLabel}.`,
          );
        }
      }

      if (!isAllAllocatedCorrectly) {
        throw new Error(
          "La suma de unidades asignadas en los bultos no coincide con el total de la orden.",
        );
      }

      const formattedShipments = shipments.map((sh) => {
        const finalTracking = sh.isOwnTransport
          ? formatMovilidadPropiaTracking(sh.driverName, sh.vehiclePlate)
          : sh.trackingNumber.trim();

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
          data.error || "Error al registrar la información de despacho",
        );
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
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="bg-white rounded-3xl p-6 border border-[#e2e8f0] max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="pb-3 border-b border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#f25c05]/10 text-[#f25c05] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-[#112237]">
                  Confirmar Despacho del Pedido
                </DialogTitle>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Registra el tracking de envío. Si requieres enviar en varias
                  guías o couriers, puedes agregar más bultos.
                </p>
              </div>
            </div>

            <Badge
              variant="default"
              className="text-xs font-black text-[#f25c05] bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200 shrink-0"
            >
              {totalUnits}{" "}
              {totalUnits === 1 ? "unidad total" : "unidades totales"}
            </Badge>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2 mt-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5 pt-2">
          <div
            className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
              isAllAllocatedCorrectly
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-amber-50 text-amber-900 border-amber-200"
            }`}
          >
            <div>
              <span className="font-bold flex items-center gap-1.5">
                {isAllAllocatedCorrectly ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Todos los productos asignados a los bultos</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Distribuye el total de unidades entre los bultos
                    </span>
                  </>
                )}
              </span>
              <div className="text-[11px] opacity-90 mt-1 flex flex-wrap gap-2">
                {items.map((it) => {
                  const alloc = itemAllocatedTotals[it.id] || 0;
                  const total = it.quantity || 1;
                  const isDone = alloc === total;
                  return (
                    <span
                      key={it.id}
                      className={`border px-2 py-0.5 rounded-md font-semibold ${
                        isDone
                          ? "bg-white/80 border-emerald-300 text-emerald-900"
                          : "bg-white/90 border-amber-300 text-amber-950"
                      }`}
                    >
                      {it.title}:{" "}
                      <strong>
                        {alloc} de {total} un.
                      </strong>
                    </span>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddShipment}
              className="bg-white text-xs font-bold border-slate-300 hover:border-[#f25c05] hover:text-[#f25c05] rounded-xl h-8.5 px-3.5 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#f25c05]" />
              <span>Agregar Bulto / Guía</span>
            </Button>
          </div>

          <div className="space-y-4">
            {shipments.map((sh, sIdx) => {
              const bultoNumber = sIdx + 1;
              const val = bultoValidations[sIdx];
              const totalInThisBulto = val?.totalItemsInBulto || 0;
              const hasIssues = val && !val.isValid;

              return (
                <div
                  key={sh.id}
                  className={`rounded-2xl p-4.5 border space-y-4 shadow-2xs transition-all ${
                    totalInThisBulto === 0
                      ? "bg-amber-50/20 border-amber-300"
                      : hasIssues
                        ? "bg-slate-50/70 border-slate-300"
                        : "bg-slate-50/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-lg bg-[#f25c05] text-white font-black text-xs flex items-center justify-center">
                        {bultoNumber}
                      </span>
                      <span className="font-extrabold text-xs text-[#112237]">
                        {shipments.length > 1
                          ? `Información de Envío (${bultoNumber} de ${shipments.length})`
                          : "Información de Envío"}
                      </span>

                      {totalInThisBulto === 0 ? (
                        <Badge
                          variant="warning"
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-300"
                        >
                          0 un. (Sin productos)
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-[11px] text-slate-700 font-extrabold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200"
                        >
                          {totalInThisBulto} un.
                        </Badge>
                      )}
                    </div>

                    {shipments.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveShipment(sIdx)}
                        className="h-7 px-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="Eliminar este bulto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Eliminar Guía</span>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                        Productos en este bulto:
                      </span>
                      {totalInThisBulto > 0 ? (
                        <span className="text-[10px] font-bold text-emerald-700">
                          {totalInThisBulto}{" "}
                          {totalInThisBulto === 1
                            ? "unidad asignada"
                            : "unidades asignadas"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700">
                          ⚠️ Asigna al menos 1 producto
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {items
                        .filter((it) => (sh.itemAllocations[it.id] ?? 0) > 0)
                        .map((it) => {
                          const currentQty = sh.itemAllocations[it.id] ?? 0;
                          const totalOrderQty = it.quantity || 1;
                          const otherBultosSum = shipments.reduce(
                            (sum, s, idx) => {
                              if (idx === sIdx) return sum;
                              return sum + (s.itemAllocations[it.id] || 0);
                            },
                            0,
                          );
                          const maxAvailableForThis = Math.max(
                            0,
                            totalOrderQty - otherBultosSum,
                          );

                          return (
                            <div
                              key={it.id}
                              className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className="w-9 h-9 bg-slate-100 rounded-lg overflow-hidden relative shrink-0 border border-slate-200 flex items-center justify-center">
                                  {it.image ? (
                                    <Image
                                      src={it.image}
                                      alt={it.title}
                                      fill
                                      sizes="36px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <Package className="w-4 h-4 text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-[#112237] truncate">
                                    {it.title}
                                  </p>
                                  <p className="text-[11px] text-slate-500">
                                    Total orden: {totalOrderQty} un. (Máx. este
                                    bulto: {maxAvailableForThis})
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden">
                                  <button
                                    type="button"
                                    disabled={currentQty <= 0}
                                    onClick={() =>
                                      handleUpdateAllocation(
                                        sIdx,
                                        it.id,
                                        currentQty - 1,
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    -
                                  </button>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={maxAvailableForThis}
                                    value={currentQty}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      handleUpdateAllocation(sIdx, it.id, val);
                                    }}
                                    className="w-12 h-7 text-center text-xs font-black border-0 bg-white rounded-none focus:ring-0 p-0"
                                  />
                                  <button
                                    type="button"
                                    disabled={currentQty >= maxAvailableForThis}
                                    onClick={() =>
                                      handleUpdateAllocation(
                                        sIdx,
                                        it.id,
                                        currentQty + 1,
                                      )
                                    }
                                    className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    +
                                  </button>
                                </div>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateAllocation(sIdx, it.id, 0)
                                  }
                                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                                  title="Quitar de este bulto"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {totalInThisBulto === 0 && (
                      <div className="p-3.5 bg-amber-50/60 border border-dashed border-amber-300 rounded-xl text-center">
                        <p className="text-xs text-amber-900 font-bold">
                          ⚠️ No has incluido productos en este bulto aún.
                        </p>
                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Haz clic abajo en los productos disponibles para
                          asignarlos a esta guía.
                        </p>
                      </div>
                    )}

                    <div className="pt-1 flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] font-bold text-slate-500">
                        + Agregar a este bulto:
                      </span>
                      {items.map((it) => {
                        const currentInThis = sh.itemAllocations[it.id] ?? 0;
                        const otherBultosSum = shipments.reduce(
                          (sum, s, idx) => {
                            if (idx === sIdx) return sum;
                            return sum + (s.itemAllocations[it.id] || 0);
                          },
                          0,
                        );
                        const availableToAssign = Math.max(
                          0,
                          (it.quantity || 1) - otherBultosSum - currentInThis,
                        );

                        const isAvailable = availableToAssign > 0;

                        return (
                          <button
                            key={it.id}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              if (isAvailable) {
                                handleUpdateAllocation(
                                  sIdx,
                                  it.id,
                                  currentInThis + availableToAssign,
                                );
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-lg text-[11px] font-bold transition-all shadow-2xs ${
                              isAvailable
                                ? "bg-white hover:bg-[#f25c05]/10 hover:border-[#f25c05] text-[#112237] hover:text-[#f25c05] border-slate-200 cursor-pointer"
                                : "bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                            }`}
                          >
                            <Plus className="w-3 h-3 text-[#f25c05]" />
                            <span className="truncate max-w-[140px]">
                              {it.title}
                            </span>
                            {isAvailable ? (
                              <span className="text-[10px] text-[#f25c05] bg-orange-50 px-1 rounded">
                                {availableToAssign} disp.
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                0 disp.
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      sh.isOwnTransport
                        ? "bg-orange-50/60 border-orange-200 text-orange-950"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sh.isOwnTransport}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        handleUpdateShipmentField(
                          sIdx,
                          "isOwnTransport",
                          checked,
                        );
                        if (checked) {
                          handleUpdateShipmentField(
                            sIdx,
                            "courier",
                            "Movilidad Propia",
                          );
                        } else {
                          handleUpdateShipmentField(sIdx, "courier", "Shalom");
                        }
                      }}
                      className="w-4 h-4 rounded text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
                    />
                    <Truck className="w-4 h-4 text-[#f25c05] shrink-0" />
                    <span className="text-xs font-bold">
                      Tengo movilidad propia / Despacho directo
                    </span>
                  </label>

                  {sh.isOwnTransport ? (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-[#112237]">
                          Empresa de Transporte *
                        </Label>
                        <Input
                          value="Movilidad Propia"
                          disabled
                          className="text-xs h-9 bg-slate-100/90 text-slate-700 font-bold cursor-not-allowed"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Nombre del Conductor
                          </Label>
                          <div className="relative">
                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Ej: Carlos Gómez"
                              value={sh.driverName}
                              onChange={(e) =>
                                handleUpdateShipmentField(
                                  sIdx,
                                  "driverName",
                                  e.target.value,
                                )
                              }
                              className="text-xs pl-8.5 h-9 bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Placa del Vehículo
                          </Label>
                          <div className="relative">
                            <Car className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Ej: ABC-123"
                              value={sh.vehiclePlate}
                              onChange={(e) =>
                                handleUpdateShipmentField(
                                  sIdx,
                                  "vehiclePlate",
                                  e.target.value,
                                )
                              }
                              className="text-xs pl-8.5 h-9 bg-white uppercase font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Fecha y Hora Estimada de Llegada *
                          </Label>
                          <div className="relative">
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
                              className="text-xs h-9 bg-white cursor-pointer"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Teléfono del Transportista / Conductor *
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Ej: 987654321"
                              value={sh.carrierPhone}
                              onChange={(e) =>
                                handleUpdateShipmentField(
                                  sIdx,
                                  "carrierPhone",
                                  e.target.value,
                                )
                              }
                              className="text-xs pl-8.5 h-9 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Empresa de Transporte *
                          </Label>
                          <Input
                            placeholder="Ej: Shalom Courier, Olva Courier, Marvisur"
                            value={sh.courier}
                            onChange={(e) =>
                              handleUpdateShipmentField(
                                sIdx,
                                "courier",
                                e.target.value,
                              )
                            }
                            className="text-xs h-9 bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Tracking ID / Número de Guía *
                          </Label>
                          <Input
                            placeholder="Ej: SHA-9842104"
                            value={sh.trackingNumber}
                            onChange={(e) =>
                              handleUpdateShipmentField(
                                sIdx,
                                "trackingNumber",
                                e.target.value,
                              )
                            }
                            className="text-xs font-mono font-bold h-9 bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Fecha y Hora Estimada de Llegada *
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
                            className="text-xs h-9 bg-white cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-[#112237]">
                            Teléfono del Transportista (Opcional)
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              placeholder="Ej: 987654321"
                              value={sh.carrierPhone}
                              onChange={(e) =>
                                handleUpdateShipmentField(
                                  sIdx,
                                  "carrierPhone",
                                  e.target.value,
                                )
                              }
                              className="text-xs pl-8.5 h-9 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-[#112237]">
                          Link de Seguimiento de la Agencia (Opcional)
                        </Label>
                        <div className="relative">
                          <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            placeholder="https://shalom.pe/rastreo/..."
                            value={sh.trackingUrl}
                            onChange={(e) =>
                              handleUpdateShipmentField(
                                sIdx,
                                "trackingUrl",
                                e.target.value,
                              )
                            }
                            className="text-xs pl-8.5 h-9 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-medium">
              {!isAllAllocatedCorrectly ? (
                <span className="text-amber-600 font-bold">
                  ⚠️ Faltan o sobran unidades por asignar
                </span>
              ) : hasAnyBultoIssue ? (
                <span className="text-amber-600 font-bold">
                  ⚠️ Revisa que todas las guías tengan productos y datos
                  completos
                </span>
              ) : (
                <span className="text-emerald-600 font-bold">
                  ✓ Listo para despachar
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
                className="text-xs font-bold text-[#64748b] hover:text-[#112237]"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>
                      {shipments.length > 1
                        ? `Guardar ${shipments.length} Bultos`
                        : "Guardar Despacho"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
