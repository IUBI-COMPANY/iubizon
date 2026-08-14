"use client";

import Link from "next/link";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { ArrowLeft, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CartSummarySidebar } from "@/components/features/cart/CartSummarySidebar";
import { peruUbigeo } from "@/data-list/ubigeos";
import type { User } from "@/types";
import type { DeliveryType, ShippingFormState } from "./checkout-schema";

interface UbigeoOption {
  name: string;
}

interface CheckoutStepShippingProps {
  user: User | null;
  shippingForm: ShippingFormState;
  register: UseFormRegister<ShippingFormState>;
  errors: FieldErrors<ShippingFormState>;
  setValue: UseFormSetValue<ShippingFormState>;
  deliveryType: DeliveryType;
  onDeliveryTypeChange: (t: DeliveryType) => void;
  provincesForDepartment: UbigeoOption[];
  districtsForProvince: UbigeoOption[];
  onDepartmentChange: (d: string) => void;
  onProvinceChange: (p: string) => void;
  onDistrictChange: (d: string) => void;
  onBack: () => void;
  onProceedToPayment: () => void;
  total: number;
  shippingCost: number;
  grandTotal: number;
  itemCount: number;
}

export function CheckoutStepShipping({
  user,
  shippingForm,
  register,
  errors,
  setValue,
  deliveryType,
  onDeliveryTypeChange,
  provincesForDepartment,
  districtsForProvince,
  onDepartmentChange,
  onProvinceChange,
  onDistrictChange,
  onBack,
  onProceedToPayment,
  total,
  shippingCost,
  grandTotal,
  itemCount,
}: CheckoutStepShippingProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-4">
        {/* SELECTOR TIPO DE ENTREGA */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] px-6 py-5 shadow-sm">
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide mb-3">
            Tipo de entrega
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDeliveryTypeChange("progressive")}
              className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                deliveryType === "progressive"
                  ? "border-[#f25c05] bg-orange-50"
                  : "border-[#e2e8f0] hover:border-[#f25c05]/40"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-[#112237]">
                  Envío Directo del Proveedor
                </p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">Más rápido</p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Cada proveedor te envía directo a tu domicilio
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  deliveryType === "progressive"
                    ? "border-[#f25c05] bg-[#f25c05]"
                    : "border-[#cbd5e1]"
                }`}
              >
                {deliveryType === "progressive" && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onDeliveryTypeChange("complete")}
              className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                deliveryType === "complete"
                  ? "border-[#112237] bg-slate-50"
                  : "border-[#e2e8f0] hover:border-[#112237]/40"
              }`}
            >
              <div>
                <p className="text-sm font-bold text-[#112237]">
                  Envío Consolidado por iubizon
                </p>
                <p className="text-[11px] text-[#94a3b8] font-medium mt-0.5">
                  Todo en una sola entrega
                </p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  Los proveedores envían a iubizon, nosotros te entregamos todo
                  junto
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                  deliveryType === "complete"
                    ? "border-[#112237] bg-[#112237]"
                    : "border-[#cbd5e1]"
                }`}
              >
                {deliveryType === "complete" && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* FORMULARIO DE DATOS */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-sm space-y-5">
          {!user && (
            <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-[#112237]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#f25c05] shrink-0" />
                <span>
                  Puedes ingresar tus datos de envío ahora. Al hacer clic en{" "}
                  <strong>Continuar al Pago</strong>, te solicitaremos iniciar
                  sesión o crear tu cuenta para proteger tu pedido.
                </span>
              </div>
              <Link
                href="/auth/login?redirect=/cart"
                className="text-[#f25c05] font-bold hover:underline shrink-0 text-[11px]"
              >
                Iniciar sesión / Registrarse
              </Link>
            </div>
          )}

          <div className="border-b border-[#f1f5f9] pb-4">
            <h2 className="font-bold text-[#112237] text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#f25c05]" />
              <span>Datos de Contacto y Dirección de Entrega</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#112237] mb-1.5">
                Nombre Completo *
              </label>
              <Input
                placeholder="Ej: Juan Carlos Pérez"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112237] mb-1.5">
                Teléfono / WhatsApp *
              </label>
              <Input placeholder="+51 999 999 999" {...register("phone")} />
              {errors.phone && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#112237] mb-1.5">
                Correo Electrónico (para tu comprobante) *
              </label>
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#112237] mb-1.5">
                Departamento *
              </label>
              <Select
                value={shippingForm.department || undefined}
                onValueChange={onDepartmentChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {peruUbigeo.map((dep) => (
                    <SelectItem key={dep.name} value={dep.name}>
                      {dep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112237] mb-1.5">
                Provincia *
              </label>
              <Select
                value={shippingForm.province || undefined}
                onValueChange={onProvinceChange}
                disabled={!shippingForm.department}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {provincesForDepartment.map((prov) => (
                    <SelectItem key={prov.name} value={prov.name}>
                      {prov.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.province && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#112237] mb-1.5">
                Distrito *
              </label>
              <Select
                value={shippingForm.district || undefined}
                onValueChange={onDistrictChange}
                disabled={!shippingForm.province}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {districtsForProvince.map((dist) => (
                    <SelectItem key={dist.name} value={dist.name}>
                      {dist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.district && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  {errors.district.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#112237] mb-1.5">
              Dirección Completa de Entrega *
            </label>
            <Input
              placeholder="Av. Larco 1234, Dpto 501"
              {...register("address")}
            />
            {errors.address && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-[#f59e0b]/30 bg-amber-50/50 p-4">
            <p className="text-xs text-[#92400e] leading-relaxed">
              Necesitamos el <strong>DNI o RUC</strong> del destinatario para
              una entrega segura.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#112237] mb-1.5">
                  Tipo de Documento *
                </label>
                <Select
                  value={shippingForm.documentType || undefined}
                  onValueChange={(value) =>
                    setValue("documentType", value as "dni" | "ruc", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dni">DNI</SelectItem>
                    <SelectItem value="ruc">RUC</SelectItem>
                  </SelectContent>
                </Select>
                {errors.documentType && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.documentType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#112237] mb-1.5">
                  Número de Documento *
                </label>
                <Input
                  placeholder={
                    shippingForm.documentType === "ruc"
                      ? "Ej: 20601234567"
                      : "Ej: 45678901"
                  }
                  maxLength={shippingForm.documentType === "ruc" ? 11 : 8}
                  {...register("documentNumber")}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setValue("documentNumber", digitsOnly, {
                      shouldValidate: true,
                    });
                  }}
                />
                {errors.documentNumber && (
                  <p className="text-xs text-red-500 font-medium mt-1">
                    {errors.documentNumber.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#112237] mb-1.5">
              Referencia o Instrucciones de Entrega (Opcional)
            </label>
            <Textarea
              placeholder="Frente al parque principal o entregar en portería..."
              rows={3}
              {...register("notes")}
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#f1f5f9]">
            <Button
              variant="outline"
              onClick={onBack}
              className="text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Carrito</span>
            </Button>

            <Button
              onClick={onProceedToPayment}
              className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Continuar al Pago</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar Resumen */}
      <div className="lg:col-span-4">
        <CartSummarySidebar
          step={2}
          subtotal={total}
          shippingCost={shippingCost}
          grandTotal={grandTotal}
          itemCount={itemCount}
        />
      </div>
    </div>
  );
}
