"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  InvoiceSelector,
  InvoiceSummaryText,
  type InvoiceType,
  type DocType,
} from "@/components/features/cart/InvoiceSelector";
import { CartSummarySidebar } from "@/components/features/cart/CartSummarySidebar";
import { PaymentMethods } from "@/components/features/checkout/PaymentMethods";
import {
  PAYMENT_METHODS,
  getPaymentMethod,
} from "@/components/features/checkout/paymentWidgets";
import type { CartItem } from "@/hooks/useCart";
import type { ShippingFormState } from "./checkout-schema";

interface CheckoutStepPaymentProps {
  invoiceType: InvoiceType;
  onInvoiceTypeChange: (t: InvoiceType) => void;
  docType: DocType;
  onDocTypeChange: (t: DocType) => void;
  invoiceDni: string;
  onDniChange: (v: string) => void;
  invoiceRuc: string;
  onRucChange: (v: string) => void;
  invoiceCompanyName: string;
  onCompanyNameChange: (v: string) => void;
  agreedToTerms: boolean;
  onAgreedToTermsChange: (v: boolean) => void;
  isOver18: boolean;
  onIsOver18Change: (v: boolean) => void;
  shippingForm: ShippingFormState;
  items: CartItem[];
  grandTotal: number;
  total: number;
  shippingCost: number;
  onValidate: () => boolean;
  onSuccess: (orderCode: string) => void;
  onError: (errorMessage: string) => void;
}

export function CheckoutStepPayment({
  invoiceType,
  onInvoiceTypeChange,
  docType,
  onDocTypeChange,
  invoiceDni,
  onDniChange,
  invoiceRuc,
  onRucChange,
  invoiceCompanyName,
  onCompanyNameChange,
  agreedToTerms,
  onAgreedToTermsChange,
  isOver18,
  onIsOver18Change,
  shippingForm,
  items,
  grandTotal,
  total,
  shippingCost,
  onValidate,
  onSuccess,
  onError,
}: CheckoutStepPaymentProps) {
  const [enabledIds, setEnabledIds] = useState<string[]>(
    PAYMENT_METHODS.map((m) => m.id),
  );
  const [selectedId, setSelectedId] = useState<string>(
    PAYMENT_METHODS[0]?.id || "",
  );

  useEffect(() => {
    fetch("/api/payments/methods")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.enabled)) {
          setEnabledIds(data.enabled);
          setSelectedId((prev) => {
            if (prev && data.enabled.includes(prev)) return prev;
            const first = PAYMENT_METHODS.find((m) =>
              data.enabled.includes(m.id),
            );
            return first?.id || "";
          });
        }
      })
      .catch(() => {});
  }, []);

  const availableMethods = useMemo(
    () => PAYMENT_METHODS.filter((m) => enabledIds.includes(m.id)),
    [enabledIds],
  );

  const selectedMethod = getPaymentMethod(selectedId) || availableMethods[0];
  const Widget = selectedMethod?.Widget;

  const invoiceDetails = useMemo(
    () => ({
      doc_type: invoiceType,
      identity_type: invoiceType === "factura" ? "ruc" : docType,
      identity_number: invoiceType === "factura" ? invoiceRuc : invoiceDni,
      legal_name:
        invoiceType === "factura" ? invoiceCompanyName : shippingForm.name,
      tax_address: shippingForm.address,
      shipping_document_type: shippingForm.documentType,
      shipping_document_number: shippingForm.documentNumber,
    }),
    [
      invoiceType,
      docType,
      invoiceRuc,
      invoiceDni,
      invoiceCompanyName,
      shippingForm.name,
      shippingForm.address,
      shippingForm.documentType,
      shippingForm.documentNumber,
    ],
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-8 space-y-6">
        {/* Selección de Método de Pago */}
        <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-[#f1f5f9] pb-4">
            <h2 className="font-bold text-[#112237] text-base flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#f25c05]" />
              <span>Selecciona el Método de Pago</span>
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Pago 100% seguro con garantía de entrega directamente en tu
              puerta.
            </p>
          </div>

          <PaymentMethods
            methods={availableMethods}
            selectedId={selectedMethod?.id || ""}
            onSelect={setSelectedId}
          />

          <InvoiceSelector
            invoiceType={invoiceType}
            onInvoiceTypeChange={onInvoiceTypeChange}
            docType={docType}
            onDocTypeChange={onDocTypeChange}
            invoiceDni={invoiceDni}
            onDniChange={onDniChange}
            invoiceRuc={invoiceRuc}
            onRucChange={onRucChange}
            invoiceCompanyName={invoiceCompanyName}
            onCompanyNameChange={onCompanyNameChange}
            grandTotal={grandTotal}
          />

          {/* Resumen de Dirección y Comprobante */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] space-y-2 text-xs">
            <p className="font-bold text-[#112237] border-b border-[#e2e8f0] pb-2">
              Resumen de Dirección y Comprobante:
            </p>
            <p className="text-[#334155]">
              <strong className="text-[#112237]">Cliente:</strong>{" "}
              {shippingForm.name} ({shippingForm.phone})
            </p>
            <p className="text-[#334155]">
              <strong className="text-[#112237]">Dirección:</strong>{" "}
              {shippingForm.address}, {shippingForm.city}
            </p>
            {shippingForm.documentType && shippingForm.documentNumber && (
              <p className="text-[#334155]">
                <strong className="text-[#112237]">
                  Documento de entrega:
                </strong>{" "}
                {shippingForm.documentType.toUpperCase()}:{" "}
                {shippingForm.documentNumber}
              </p>
            )}
            <p className="text-[#334155]">
              <strong className="text-[#112237]">Comprobante:</strong>{" "}
              <InvoiceSummaryText
                invoiceType={invoiceType}
                invoiceRuc={invoiceRuc}
                invoiceCompanyName={invoiceCompanyName}
                invoiceDni={invoiceDni}
                docType={docType}
              />
            </p>
            {shippingForm.notes && (
              <p className="text-[#334155]">
                <strong className="text-[#112237]">Ref:</strong>{" "}
                {shippingForm.notes}
              </p>
            )}
          </div>

          {/* Términos y Condiciones + mayoría de edad (requerido por Niubiz) */}
          <div className="space-y-3 pt-1">
            <Checkbox
              name="agreedToTerms"
              checked={agreedToTerms}
              onChange={onAgreedToTermsChange}
            >
              <span className="text-xs text-[#64748b] leading-relaxed font-normal">
                Acepto los{" "}
                <Link
                  href="/help?tab=terminos"
                  target="_blank"
                  className="text-[#f25c05] hover:underline font-medium"
                >
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/help?tab=terminosprivacy"
                  target="_blank"
                  className="text-[#f25c05] hover:underline font-medium"
                >
                  Política de Privacidad
                </Link>
                .
              </span>
            </Checkbox>
            <Checkbox
              name="isOver18"
              checked={isOver18}
              onChange={onIsOver18Change}
            >
              <span className="text-xs text-[#64748b] leading-relaxed font-normal">
                Confirmo que soy <strong>mayor de 18 años</strong>.
              </span>
            </Checkbox>
          </div>

          {Widget && (
            <div className="pt-4 w-full">
              <Widget
                amount={grandTotal}
                cartItems={items}
                shippingForm={shippingForm}
                invoiceDetails={invoiceDetails}
                onValidate={onValidate}
                onSuccess={onSuccess}
                onError={onError}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Resumen Final */}
      <div className="lg:col-span-4">
        <CartSummarySidebar
          step={3}
          subtotal={total}
          shippingCost={shippingCost}
          grandTotal={grandTotal}
          itemCount={items.length}
        />
      </div>
    </div>
  );
}
