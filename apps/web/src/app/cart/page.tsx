"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { CartStepIndicator } from "@/components/features/cart/CartStepIndicator";
import { CheckoutStepCart } from "@/components/features/cart/CheckoutStepCart";
import { CheckoutStepShipping } from "@/components/features/cart/CheckoutStepShipping";
import { CheckoutStepPayment } from "@/components/features/cart/CheckoutStepPayment";
import {
  STEP_STORAGE_KEY,
  FORM_STORAGE_KEY,
  INVOICE_STORAGE_KEY,
  TERMS_STORAGE_KEY,
  type DeliveryType,
} from "@/components/features/cart/checkout-schema";
import type { PaymentSuccessData } from "@/components/features/checkout/paymentWidgets";

import { useCheckoutForm } from "@/components/features/cart/hooks/useCheckoutForm";
import { useCheckoutInvoice } from "@/components/features/cart/hooks/useCheckoutInvoice";
import { useCheckoutRecommendations } from "@/components/features/cart/hooks/useCheckoutRecommendations";

export default function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { companies } = useCompany();
  const { items, addItem, removeItem, updateQuantity, clearCart, total } =
    useCart();
  const toast = useToast();

  const [step, setStep] = useState<number>(1);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("progressive");

  // Hook 1: Formulario de Envío y Ubigeo
  const {
    register,
    handleSubmit,
    setValue,
    errors,
    shippingForm,
    provincesForDepartment,
    districtsForProvince,
    hasValidProvinceDocument,
    handleDepartmentChange,
    handleProvinceChange,
    handleDistrictChange,
  } = useCheckoutForm({ user });

  // Cálculos Financieros Memorizados
  const subtotal = total;
  const shippingCost = 0.0;
  const grandTotal = useMemo(
    () => subtotal + shippingCost,
    [subtotal, shippingCost],
  );

  // Hook 2: Comprobante de Pago y Términos
  const {
    invoiceType,
    setInvoiceType,
    docType,
    setDocType,
    invoiceDni,
    setInvoiceDni,
    invoiceRuc,
    setInvoiceRuc,
    invoiceCompanyName,
    setInvoiceCompanyName,
    agreedToTerms,
    setAgreedToTerms,
    isOver18,
    setIsOver18,
    validateCheckout,
  } = useCheckoutInvoice({ grandTotal, shippingForm });

  // Hook 3: Recomendaciones y Order Bumps
  const {
    recommendations,
    loadingRecs,
    recsPage,
    recsHasMore,
    fetchRecommendations,
    handleAddBump,
  } = useCheckoutRecommendations({ items, companies, addItem });

  const hasProcessedUrlParams = useRef(false);

  // Restaurar paso inicial y procesar respuesta Niubiz si viene por URL (ej. timeout o error de pasarela)
  useEffect(() => {
    if (typeof window === "undefined" || hasProcessedUrlParams.current) return;
    hasProcessedUrlParams.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get("success") === "true";
    const orderCode =
      urlParams.get("sessionCode") || urlParams.get("order_code");
    const rawError = urlParams.get("error");

    // Limpiar los parámetros de la URL inmediatamente para evitar ejecuciones repetidas al re-renderizar
    if (isSuccess || rawError) {
      window.history.replaceState({}, "", "/cart");
    }

    if (isSuccess && orderCode) {
      clearCart();
      localStorage.removeItem(STEP_STORAGE_KEY);
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(INVOICE_STORAGE_KEY);
      localStorage.removeItem(TERMS_STORAGE_KEY);
      toast.success(
        `¡Pago exitoso con tarjeta Niubiz! Orden #${orderCode}`,
        "Pago Confirmado",
      );
      router.push(`/cart/result?order_code=${orderCode}`);
      return;
    }

    if (rawError && rawError !== "Accept") {
      // Extraer únicamente la clave limpia del error (elimina query-strings anidados tipo timeout?timeout=1)
      const cleanErrorKey = rawError.split("?")[0].split("&")[0].trim();

      let friendlyMsg = `No se pudo completar el pago: ${cleanErrorKey}`;
      if (cleanErrorKey.toLowerCase().includes("timeout")) {
        friendlyMsg =
          "El tiempo para completar la transacción ha expirado (20 minutos). Puedes volver a intentarlo.";
      }

      // En caso de error o timeout, asegurar volver al paso 2 sin bucles de renderizado
      setStep(2);
      localStorage.setItem(STEP_STORAGE_KEY, "2");

      toast.error(friendlyMsg, "Tiempo Expirado o Pago Cancelado");
      return;
    }

    // Si no hubo parámetros de retorno en la URL, restaurar paso guardado normalmente
    const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
    if (savedStep) {
      const parsedStep = parseInt(savedStep, 10);
      if (parsedStep >= 1 && parsedStep <= 3) {
        setStep(parsedStep);
      }
    }
  }, [clearCart, router, toast]);

  // Persistir paso activo
  const handleStepChange = (newStep: number) => {
    if (newStep === 3 && !user) {
      toast.info(
        "Para continuar con tu compra, por favor inicia sesión o regístrate.",
        "Inicio de Sesión Requerido",
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(STEP_STORAGE_KEY, "2");
      }
      router.push("/auth/login?redirect=/cart");
      return;
    }
    setStep(newStep);
    if (typeof window !== "undefined") {
      localStorage.setItem(STEP_STORAGE_KEY, newStep.toString());
    }
  };

  // Regresar al paso 2 si intenta estar en el paso 3 sin sesión
  useEffect(() => {
    if (step === 3 && !user) {
      setStep(2);
      if (typeof window !== "undefined") {
        localStorage.setItem(STEP_STORAGE_KEY, "2");
      }
    }
  }, [step, user]);

  // Avanzar al Paso 3 (Pago) tras validar formulario de envío
  const handleProceedToStep3 = handleSubmit(
    (formData) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STEP_STORAGE_KEY, "2");
      }

      if (!user) {
        toast.info(
          "Para continuar con tu compra, por favor inicia sesión o regístrate.",
          "Inicio de Sesión Requerido",
        );
        router.push("/auth/login?redirect=/cart");
        return;
      }

      handleStepChange(3);
    },
    (formErrors) => {
      const firstError = Object.values(formErrors)[0];
      toast.error(
        firstError?.message || "Completa los datos de envío para continuar.",
        "Datos incompletos",
      );
    },
  );

  // Éxito del pago: limpiar estado y redirigir al comprobante
  const handlePaymentSuccess = (data: PaymentSuccessData) => {
    toast.success(
      "¡Pago autorizado con éxito por Niubiz! Tu pedido está confirmado.",
      "¡Gracias por tu compra!",
    );
    clearCart();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STEP_STORAGE_KEY);
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(INVOICE_STORAGE_KEY);
      localStorage.removeItem(TERMS_STORAGE_KEY);
      const packageMap = new Map<
        string,
        { productTitles: string[]; itemCount: number }
      >();
      for (const item of items) {
        const key = item.company_id;
        if (!packageMap.has(key)) {
          packageMap.set(key, { productTitles: [], itemCount: 0 });
        }
        const entry = packageMap.get(key)!;
        entry.productTitles.push(item.title);
        entry.itemCount += item.quantity;
      }
      sessionStorage.setItem(
        "iubizon_order_packages",
        JSON.stringify(
          Array.from(packageMap.entries()).map(([companyId, data]) => ({
            packageId: companyId,
            companyId,
            itemCount: data.itemCount,
            productTitles: data.productTitles,
          })),
        ),
      );
    }

    const params = new URLSearchParams({
      order_code: data.orderCode,
      amount: String(data.amount ?? ""),
      currency: data.currency || "PEN",
      cardBrand: data.cardBrand ?? "",
      cardLast4: data.cardLast4 ?? "",
      transactionDate: data.transactionDate || new Date().toISOString(),
    });
    router.push(`/cart/result?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Cabecera & Wizard Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#112237] flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-[#f25c05]" />
              <span>Proceso de Compra</span>
            </h1>
            <span className="text-xs font-semibold text-[#64748b] bg-white border border-[#e2e8f0] px-3 py-1 rounded-full shadow-sm">
              Paso {step} de 3
            </span>
          </div>

          <CartStepIndicator
            step={step}
            onStepChange={handleStepChange}
            canGoToStep2={items.length > 0}
            canGoToStep3={
              items.length > 0 &&
              Boolean(
                shippingForm.address &&
                shippingForm.department &&
                shippingForm.province &&
                shippingForm.district &&
                hasValidProvinceDocument,
              )
            }
          />
        </div>

        {/* PASO 1: CARRITO Y ORDER BUMPS */}
        {step === 1 && (
          <CheckoutStepCart
            items={items}
            total={total}
            shippingCost={shippingCost}
            grandTotal={grandTotal}
            recommendations={recommendations}
            loadingRecs={loadingRecs}
            recsPage={recsPage}
            recsHasMore={recsHasMore}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
            onClearCart={clearCart}
            onAddBump={handleAddBump}
            onLoadRecommendations={fetchRecommendations}
            onNextStep={() => handleStepChange(2)}
          />
        )}

        {/* PASO 2: DATOS DE CONTACTO Y ENVÍO */}
        {step === 2 && (
          <CheckoutStepShipping
            user={user}
            shippingForm={shippingForm}
            register={register}
            errors={errors}
            setValue={setValue}
            deliveryType={deliveryType}
            onDeliveryTypeChange={setDeliveryType}
            provincesForDepartment={provincesForDepartment}
            districtsForProvince={districtsForProvince}
            onDepartmentChange={handleDepartmentChange}
            onProvinceChange={handleProvinceChange}
            onDistrictChange={handleDistrictChange}
            onBack={() => handleStepChange(1)}
            onProceedToPayment={handleProceedToStep3}
            total={total}
            shippingCost={shippingCost}
            grandTotal={grandTotal}
            itemCount={items.length}
          />
        )}

        {/* PASO 3: CONFIRMAR Y PAGO CON NIUBIZ */}
        {step === 3 && (
          <CheckoutStepPayment
            invoiceType={invoiceType}
            onInvoiceTypeChange={setInvoiceType}
            docType={docType}
            onDocTypeChange={setDocType}
            invoiceDni={invoiceDni}
            onDniChange={setInvoiceDni}
            invoiceRuc={invoiceRuc}
            onRucChange={setInvoiceRuc}
            invoiceCompanyName={invoiceCompanyName}
            onCompanyNameChange={setInvoiceCompanyName}
            agreedToTerms={agreedToTerms}
            onAgreedToTermsChange={setAgreedToTerms}
            isOver18={isOver18}
            onIsOver18Change={setIsOver18}
            shippingForm={shippingForm}
            items={items}
            grandTotal={grandTotal}
            total={total}
            shippingCost={shippingCost}
            onValidate={validateCheckout}
            onSuccess={handlePaymentSuccess}
            onError={(errorMessage) => {
              toast.error(errorMessage, "Error al procesar el pago");
            }}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
