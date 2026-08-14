"use client";

import Link from "next/link";
import { CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  InvoiceSelector,
  InvoiceSummaryText,
  type InvoiceType,
  type DocType,
} from "@/components/features/cart/InvoiceSelector";
import { CartSummarySidebar } from "@/components/features/cart/CartSummarySidebar";
import { NiubizPayModal } from "@/components/features/checkout/NiubizPayModal";
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Método 1: Tarjeta Niubiz (ACTIVO) */}
            <div className="border-2 border-[#f25c05] bg-orange-50/50 p-4 rounded-2xl flex flex-col justify-between shadow-sm cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <CreditCard className="w-6 h-6 text-[#f25c05]" />
                <span className="bg-[#f25c05] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  OFICIAL / ACTIVO
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-[#112237]">
                  Tarjeta Crédito / Débito (Niubiz)
                </p>
                <p className="text-[11px] text-[#64748b] mt-0.5">
                  Visa, Mastercard, American Express. Pago 100% seguro.
                </p>
              </div>
            </div>

            {/* Método 2: PayPal (Próximamente) */}
            <div className="border border-slate-200 bg-slate-50 p-4 rounded-2xl flex flex-col justify-between opacity-60 cursor-not-allowed">
              <div className="flex items-center justify-between mb-3">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Próximamente
                </span>
              </div>
              <div>
                <p className="font-bold text-sm text-slate-700">PayPal</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pagos internacionales rápidos y seguros.
                </p>
              </div>
            </div>
          </div>

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
                  href="/terms"
                  target="_blank"
                  className="text-[#f25c05] hover:underline font-medium"
                >
                  Términos y Condiciones
                </Link>{" "}
                y la{" "}
                <Link
                  href="/privacy"
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

          <div className="pt-4 w-full">
            <NiubizPayModal
              amount={grandTotal}
              cartItems={items}
              shippingForm={shippingForm}
              onValidate={onValidate}
              invoiceDetails={{
                doc_type: invoiceType,
                identity_type: invoiceType === "factura" ? "ruc" : docType,
                identity_number:
                  invoiceType === "factura" ? invoiceRuc : invoiceDni,
                legal_name:
                  invoiceType === "factura"
                    ? invoiceCompanyName
                    : shippingForm.name,
                tax_address: shippingForm.address,
                shipping_document_type: shippingForm.documentType,
                shipping_document_number: shippingForm.documentNumber,
              }}
              onSuccess={onSuccess}
              onError={onError}
            />
          </div>
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
