"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
import {
  AlertCircle,
  Car,
  CheckCircle,
  Loader2,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";

import {
  isOwnMobilityCourier,
  parseDriverAndPlate,
  formatMovilidadPropiaTracking,
  formatDateForDatetimeInput,
} from "@/lib/utils/tracking";

export interface EditSingleShipmentData {
  packageId: string;
  packageNumber?: number;
  totalPackages?: number;
  orderCode?: string;
  trackingId?: string;
  courier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  carrierPhone?: string | null;
  estimatedDelivery?: string | null;
  status?: string;
  items: Array<{
    id?: string;
    productId?: string;
    title: string;
    quantity: number;
    image?: string | null;
  }>;
}

interface EditSingleShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: EditSingleShipmentData | null;
  onSuccess: () => void;
}

export function EditSingleShipmentModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: EditSingleShipmentModalProps) {
  const [isOwnTransport, setIsOwnTransport] = useState(false);
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [carrierPhone, setCarrierPhone] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shipment && isOpen) {
      const isPropia =
        isOwnMobilityCourier(shipment.courier) ||
        isOwnMobilityCourier(shipment.trackingNumber);

      setIsOwnTransport(isPropia);
      setCourier(isPropia ? "Movilidad Propia" : shipment.courier || "Shalom");

      const { driverName: parsedDriver, vehiclePlate: parsedPlate } =
        parseDriverAndPlate(shipment.trackingNumber);

      if (isPropia) {
        setDriverName(parsedDriver);
        setVehiclePlate(parsedPlate);
        setTrackingNumber("");
      } else {
        setDriverName("");
        setVehiclePlate("");
        setTrackingNumber(shipment.trackingNumber || "");
      }

      setTrackingUrl(shipment.trackingUrl || "");
      setCarrierPhone(shipment.carrierPhone || "");
      setEstimatedDelivery(
        formatDateForDatetimeInput(shipment.estimatedDelivery),
      );
      setError(null);
    }
  }, [shipment, isOpen]);

  if (!shipment) return null;

  const totalUnits = shipment.items.reduce(
    (acc, i) => acc + (i.quantity || 1),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalCourier = courier.trim();
    let finalTrackingNumber = trackingNumber.trim();

    if (isOwnTransport) {
      finalCourier = "Movilidad Propia";
      if (!carrierPhone.trim()) {
        setError("El teléfono del conductor es requerido.");
        return;
      }
      if (!estimatedDelivery.trim()) {
        setError("La fecha y hora estimada de llegada es requerida.");
        return;
      }
      finalTrackingNumber = formatMovilidadPropiaTracking(
        driverName,
        vehiclePlate,
      );
    } else {
      if (!finalCourier) {
        setError("La empresa de transporte es requerida.");
        return;
      }
      if (!finalTrackingNumber) {
        setError("El número de guía / tracking es requerido.");
        return;
      }
      if (!estimatedDelivery.trim()) {
        setError("La fecha y hora estimada de llegada es requerida.");
        return;
      }
    }

    try {
      setIsSaving(true);
      setError(null);

      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_shipment",
          packageId: shipment.packageId,
          courier: finalCourier,
          trackingNumber: finalTrackingNumber,
          trackingUrl: trackingUrl.trim() || null,
          carrierPhone: carrierPhone.trim() || null,
          estimatedDelivery,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la guía de envío");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar los cambios",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const bultoNumber = shipment.packageNumber || 1;
  const totalPackages = shipment.totalPackages || 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSaving && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-6 rounded-3xl">
        <DialogHeader className="border-b border-[#f1f5f9] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#f25c05] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-[#112237]">
                Editar Guía de Despacho
              </DialogTitle>
              {shipment.orderCode && (
                <span className="text-xs text-slate-500 font-semibold">
                  Orden #{shipment.orderCode} · {shipment.trackingId}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Card con el mismo formato y diseño que cuando se crea la guía */}
          <div className="rounded-2xl p-4.5 border bg-slate-50/70 border-slate-200 space-y-4 shadow-2xs">
            {/* Header del Bulto */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-6 h-6 rounded-lg bg-[#f25c05] text-white font-black text-xs flex items-center justify-center">
                  {bultoNumber}
                </span>
                <span className="font-extrabold text-xs text-[#112237]">
                  {totalPackages > 1
                    ? `Información de Envío (${bultoNumber} de ${totalPackages})`
                    : "Información de Envío"}
                </span>

                <Badge
                  variant="secondary"
                  className="text-[11px] text-slate-700 font-extrabold bg-white px-2.5 py-0.5 rounded-lg border border-slate-200"
                >
                  {totalUnits} un.
                </Badge>
              </div>
            </div>

            {/* Productos en este Bulto */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block">
                  PRODUCTOS EN ESTE BULTO:
                </span>
                <span className="text-[10px] font-bold text-emerald-700">
                  {totalUnits}{" "}
                  {totalUnits === 1 ? "unidad asignada" : "unidades asignadas"}
                </span>
              </div>

              <div className="space-y-2">
                {shipment.items.map((it, idx) => (
                  <div
                    key={it.id || idx}
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
                            unoptimized
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
                          Cantidad en este bulto: {it.quantity} un.
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className="font-extrabold text-xs text-[#112237] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                        {it.quantity} un.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkbox Movilidad Propia */}
            <label
              className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                isOwnTransport
                  ? "bg-orange-50/60 border-orange-200 text-orange-950"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <input
                type="checkbox"
                checked={isOwnTransport}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsOwnTransport(checked);
                  if (checked) {
                    setCourier("Movilidad Propia");
                  } else {
                    setCourier(
                      shipment.courier &&
                        !shipment.courier.toLowerCase().includes("propia")
                        ? shipment.courier
                        : "Shalom",
                    );
                  }
                }}
                className="w-4 h-4 rounded text-[#f25c05] focus:ring-[#f25c05] cursor-pointer"
              />
              <Truck className="w-4 h-4 text-[#f25c05] shrink-0" />
              <span className="text-xs font-bold">
                Tengo movilidad propia / Despacho directo
              </span>
            </label>

            {/* Campos de Transporte según modalidad */}
            {isOwnTransport ? (
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
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
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
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
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
                    <Input
                      type="datetime-local"
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="text-xs h-9 bg-white cursor-pointer"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-[#112237]">
                      Teléfono del Transportista / Conductor *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Ej: 987654321"
                        value={carrierPhone}
                        onChange={(e) => setCarrierPhone(e.target.value)}
                        className="text-xs pl-8.5 h-9 bg-white"
                        required
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
                      placeholder="Ej: Shalom, Olva Courier, Marvisur"
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="text-xs h-9 bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold text-[#112237]">
                      Tracking ID / Número de Guía *
                    </Label>
                    <Input
                      placeholder="Ej: SHA-123"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="text-xs font-mono font-bold h-9 bg-white"
                      required
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
                      value={estimatedDelivery}
                      onChange={(e) => setEstimatedDelivery(e.target.value)}
                      className="text-xs h-9 bg-white cursor-pointer"
                      required
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
                        value={carrierPhone}
                        onChange={(e) => setCarrierPhone(e.target.value)}
                        className="text-xs pl-8.5 h-9 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-[#112237]">
                    Link de Seguimiento de la Agencia (Opcional)
                  </Label>
                  <Input
                    placeholder="https://shalom.com/SHA-123"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="text-xs h-9 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
