"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShoppingCart } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { CartStepIndicator } from "@/components/features/cart/CartStepIndicator";
import type { OrderBump } from "@/components/features/cart/CartOrderBumps";
import { CheckoutStepCart } from "@/components/features/cart/CheckoutStepCart";
import { CheckoutStepShipping } from "@/components/features/cart/CheckoutStepShipping";
import { CheckoutStepPayment } from "@/components/features/cart/CheckoutStepPayment";
import type {
  InvoiceType,
  DocType,
} from "@/components/features/cart/InvoiceSelector";
import { peruUbigeo } from "@/data-list/ubigeos";
import {
  STEP_STORAGE_KEY,
  FORM_STORAGE_KEY,
  INVOICE_STORAGE_KEY,
  TERMS_STORAGE_KEY,
  buildCityLabel,
  shippingFormSchema,
  type ShippingFormState,
  type DeliveryType,
} from "@/components/features/cart/checkout-schema";
import type { PaymentSuccessData } from "@/components/features/checkout/paymentWidgets";

export default function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { companies } = useCompany();
  const { items, addItem, removeItem, updateQuantity, clearCart, total } =
    useCart();
  const toast = useToast();

  const [step, setStep] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<OrderBump[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsPage, setRecsPage] = useState<number>(1);
  const [recsHasMore, setRecsHasMore] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("progressive");

  // Comprobante de pago (Boleta vs Factura)
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("boleta");
  const [docType, setDocType] = useState<DocType>("dni");
  const [invoiceDni, setInvoiceDni] = useState("");
  const [invoiceRuc, setInvoiceRuc] = useState("");
  const [invoiceCompanyName, setInvoiceCompanyName] = useState("");

  // Términos y Condiciones + confirmación de mayoría de edad (requeridos por Niubiz)
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isOver18, setIsOver18] = useState(false);

  // Formulario de envío validado con Zod + React Hook Form, con Auto-Guardado en LocalStorage
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<ShippingFormState>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      name: user?.name || "",
      phone: "",
      email: user?.email || "",
      address: "",
      department: "Lima",
      province: "Lima",
      district: "",
      documentType: "dni",
      documentNumber: "",
      city: "Lima",
      notes: "",
    },
  });

  const shippingForm = watch();

  // Restaurar paso y datos del formulario desde LocalStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);
      if (savedStep) {
        const parsedStep = parseInt(savedStep, 10);
        if (parsedStep >= 1 && parsedStep <= 3) {
          setStep(parsedStep);
        }
      }

      const savedForm = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedForm) {
        try {
          const parsedForm = JSON.parse(savedForm);
          reset((prev) => ({ ...prev, ...parsedForm }));
        } catch (e) {
          console.error("Error al restaurar formulario de checkout:", e);
        }
      }

      const savedInvoice = localStorage.getItem(INVOICE_STORAGE_KEY);
      if (savedInvoice) {
        try {
          const parsed = JSON.parse(savedInvoice);
          if (parsed.invoiceType) setInvoiceType(parsed.invoiceType);
          if (parsed.docType) setDocType(parsed.docType);
          if (parsed.invoiceDni) setInvoiceDni(parsed.invoiceDni);
          if (parsed.invoiceRuc) setInvoiceRuc(parsed.invoiceRuc);
          if (parsed.invoiceCompanyName)
            setInvoiceCompanyName(parsed.invoiceCompanyName);
        } catch {}
      }

      const savedTerms = localStorage.getItem(TERMS_STORAGE_KEY);
      if (savedTerms) {
        try {
          const parsed = JSON.parse(savedTerms);
          if (typeof parsed.agreedToTerms === "boolean") {
            setAgreedToTerms(parsed.agreedToTerms);
          }
          if (typeof parsed.isOver18 === "boolean") {
            setIsOver18(parsed.isOver18);
          }
        } catch {}
      }

      // Procesar retorno de Niubiz si vino por redirección en URL (success / error)
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get("success") === "true";
      const orderCode =
        urlParams.get("sessionCode") || urlParams.get("order_code");
      const errorMsg = urlParams.get("error");

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
      } else if (errorMsg && errorMsg !== "Accept") {
        toast.error(
          `No se pudo completar el pago: ${errorMsg}`,
          "Pago Rechazado",
        );
      }
    }
  }, []);

  // Persistir los campos del formulario en LocalStorage mientras se escribe
  useEffect(() => {
    const subscription = watch((value) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Persistir campos de comprobante de pago en LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        INVOICE_STORAGE_KEY,
        JSON.stringify({
          invoiceType,
          docType,
          invoiceDni,
          invoiceRuc,
          invoiceCompanyName,
        }),
      );
    }
  }, [invoiceType, docType, invoiceDni, invoiceRuc, invoiceCompanyName]);

  // Persistir aceptación de T&C y mayoría de edad en LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        TERMS_STORAGE_KEY,
        JSON.stringify({ agreedToTerms, isOver18 }),
      );
    }
  }, [agreedToTerms, isOver18]);

  // Sincronizar email/nombre cuando el usuario inicie sesión
  useEffect(() => {
    if (user) {
      if (!getValues("name")) setValue("name", user.name || "");
      if (!getValues("email")) setValue("email", user.email || "");
    }
  }, [user, getValues, setValue]);

  // Persistir paso activo en LocalStorage (requiere sesión para el Paso 3)
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

  // Si intenta estar en el paso 3 sin sesión (ej: recarga de página), regresar al paso 2
  useEffect(() => {
    if (step === 3 && !user) {
      setStep(2);
      if (typeof window !== "undefined") {
        localStorage.setItem(STEP_STORAGE_KEY, "2");
      }
    }
  }, [step, user]);

  // Provincias/distritos disponibles según el departamento/provincia seleccionados (ubigeo)
  const provincesForDepartment = useMemo(
    () =>
      peruUbigeo.find((d) => d.name === shippingForm.department)?.provinces ||
      [],
    [shippingForm.department],
  );
  const districtsForProvince = useMemo(
    () =>
      provincesForDepartment.find((p) => p.name === shippingForm.province)
        ?.districts || [],
    [provincesForDepartment, shippingForm.province],
  );
  const hasValidProvinceDocument = useMemo(() => {
    const docTypeValue = shippingForm.documentType;
    const docNumber = (shippingForm.documentNumber || "").trim();
    const isDniValid = docTypeValue === "dni" && /^\d{8}$/.test(docNumber);
    const isRucValid = docTypeValue === "ruc" && /^\d{11}$/.test(docNumber);
    return isDniValid || isRucValid;
  }, [shippingForm.documentType, shippingForm.documentNumber]);

  // Selección en cascada Departamento -> Provincia -> Distrito
  const handleDepartmentChange = (department: string) => {
    setValue("department", department, { shouldValidate: true });
    setValue("province", "", { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
    setValue("city", buildCityLabel(department, "", ""));
  };

  const handleProvinceChange = (province: string) => {
    setValue("province", province, { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
    setValue("city", buildCityLabel(shippingForm.department, province, ""));
  };

  const handleDistrictChange = (district: string) => {
    setValue("district", district, { shouldValidate: true });
    setValue(
      "city",
      buildCityLabel(shippingForm.department, shippingForm.province, district),
    );
  };

  // Cargar productos complementarios (Order Bumps) con Paginación
  const fetchRecommendations = useCallback(
    async (pageToFetch = 1) => {
      try {
        setLoadingRecs(true);
        const excludeIds = items
          .map((i) => i.product_id)
          .filter(Boolean)
          .join(",");
        const ownCompanyIds = companies
          .map((c) => c.id)
          .filter(Boolean)
          .join(",");
        const params = new URLSearchParams({
          exclude: excludeIds,
          page: String(pageToFetch),
          limit: "6",
        });
        if (ownCompanyIds) params.set("excludeCompanies", ownCompanyIds);
        const res = await fetch(
          `/api/products/recommendations?${params.toString()}`,
        );
        const data = await res.json();
        if (Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
          setRecsHasMore(!!data.pagination?.hasMore);
          setRecsPage(pageToFetch);
        }
      } catch (err) {
        console.error("Error al cargar recomendaciones afines:", err);
      } finally {
        setLoadingRecs(false);
      }
    },
    [items, companies],
  );

  const filteredRecommendations = useMemo(() => {
    const cartProductIds = new Set(items.map((i) => i.product_id));
    return recommendations.filter((rec) => !cartProductIds.has(rec.id));
  }, [recommendations, items]);

  useEffect(() => {
    fetchRecommendations(1);
  }, [items, fetchRecommendations]);

  // Cálculos Financieros Memoizados (Envío GRATIS por Promoción de Lanzamiento)
  const subtotal = total;
  const shippingCost = 0.0;
  const grandTotal = useMemo(
    () => subtotal + shippingCost,
    [subtotal, shippingCost],
  );

  // Añadir un Order Bump al carrito de 1 solo clic
  const handleAddBump = (bump: OrderBump) => {
    addItem({
      id: bump.id,
      title: bump.title,
      price: bump.price,
      company_id: bump.company_id,
      images: bump.image_url ? [{ url: bump.image_url }] : [],
      stock: typeof bump.stock === "number" ? bump.stock : 10,
    });
    toast.success(`"${bump.title}" agregado al paquete`, "¡Producto Añadido!");
  };

  // Validación del formulario de envío (Zod + RHF) para avanzar al paso 3
  const handleProceedToStep3 = handleSubmit(
    (formData) => {
      // 1. Guardar los datos ingresados en LocalStorage para no perder la información
      if (typeof window !== "undefined") {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STEP_STORAGE_KEY, "2");
      }

      // 2. Si el usuario NO ha iniciado sesión, solicitamos que se registre o inicie sesión
      if (!user) {
        toast.info(
          "Para continuar con tu compra, por favor inicia sesión o regístrate.",
          "Inicio de Sesión Requerido",
        );
        router.push("/auth/login?redirect=/cart");
        return;
      }

      // 3. Si ya inició sesión, avanzamos al paso 3 (Pago)
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

  // Validación de datos de factura/boleta antes de abrir la pasarela Niubiz
  const validateInvoiceDetails = (): boolean => {
    const docTypeValue = shippingForm.documentType;
    const docNumber = (shippingForm.documentNumber || "").trim();

    if (!docTypeValue || !docNumber) {
      toast.error(
        "Debes registrar un DNI (8) o RUC (11) válido del destinatario.",
        "Documento requerido",
      );
      return false;
    }

    if (invoiceType === "factura") {
      const cleanRuc = invoiceRuc.trim();
      if (!cleanRuc || cleanRuc.length !== 11) {
        toast.error(
          "El número de RUC es obligatorio y debe tener exactamente 11 dígitos para emitir Factura.",
          "Comprobante Requerido",
        );
        return false;
      }
      if (!invoiceCompanyName.trim()) {
        toast.error(
          "La Razón Social de la empresa es obligatoria para emitir Factura.",
          "Comprobante Requerido",
        );
        return false;
      }
    } else if (invoiceType === "boleta") {
      if (grandTotal > 700) {
        const cleanDni = invoiceDni.trim();
        if (!cleanDni || (docType === "dni" && cleanDni.length !== 8)) {
          toast.error(
            `El número de ${docType.toUpperCase()} es obligatorio para compras mayores a S/ 700 (Exigencia SUNAT).`,
            "Comprobante Requerido",
          );
          return false;
        }
      }
    }
    return true;
  };

  // Validación completa antes de abrir la pasarela Niubiz (comprobante + T&C + edad)
  const validateCheckout = (): boolean => {
    if (!validateInvoiceDetails()) return false;

    if (!agreedToTerms) {
      toast.error(
        "Debes aceptar los Términos y Condiciones para continuar.",
        "Aceptación requerida",
      );
      return false;
    }

    if (!isOver18) {
      toast.error(
        "Debes confirmar que eres mayor de 18 años para continuar.",
        "Confirmación requerida",
      );
      return false;
    }

    return true;
  };

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
            recommendations={filteredRecommendations}
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
