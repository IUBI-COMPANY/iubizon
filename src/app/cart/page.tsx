"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Truck,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { CartStepIndicator } from "@/components/features/cart/CartStepIndicator";
import {
  CartOrderBumps,
  type OrderBump,
} from "@/components/features/cart/CartOrderBumps";
import { CartSummarySidebar } from "@/components/features/cart/CartSummarySidebar";
import {
  InvoiceSelector,
  InvoiceSummaryText,
  type InvoiceType,
  type DocType,
} from "@/components/features/cart/InvoiceSelector";
import { NiubizPayModal } from "@/components/features/checkout/NiubizPayModal";

const STEP_STORAGE_KEY = "iubizon_checkout_step";
const FORM_STORAGE_KEY = "iubizon_checkout_form";

export interface ShippingFormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

export default function CartCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, addItem, removeItem, updateQuantity, clearCart, total } =
    useCart();
  const toast = useToast();

  const [step, setStep] = useState<number>(1);
  const [recommendations, setRecommendations] = useState<OrderBump[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recsPage, setRecsPage] = useState<number>(1);
  const [recsHasMore, setRecsHasMore] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<"progressive" | "complete">(
    "progressive",
  );

  // Comprobante de pago (Boleta vs Factura)
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("boleta");
  const [docType, setDocType] = useState<DocType>("dni");
  const [invoiceDni, setInvoiceDni] = useState("");
  const [invoiceRuc, setInvoiceRuc] = useState("");
  const [invoiceCompanyName, setInvoiceCompanyName] = useState("");

  // Formulario de envío con Auto-Guardado en LocalStorage
  const [shippingForm, setShippingForm] = useState<ShippingFormState>({
    name: user?.name || "",
    phone: "",
    email: user?.email || "",
    address: "",
    city: "Lima",
    notes: "",
  });

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
          setShippingForm((prev) => ({ ...prev, ...parsedForm }));
        } catch (e) {
          console.error("Error al restaurar formulario de checkout:", e);
        }
      }

      // Procesar retorno de Niubiz si vino por redirección en URL (success / error)
      const urlParams = new URLSearchParams(window.location.search);
      const isSuccess = urlParams.get("success") === "true";
      const sessionCode = urlParams.get("sessionCode");
      const errorMsg = urlParams.get("error");

      if (isSuccess && sessionCode) {
        clearCart();
        localStorage.removeItem(STEP_STORAGE_KEY);
        localStorage.removeItem(FORM_STORAGE_KEY);
        toast.success(
          `¡Pago exitoso con tarjeta Niubiz! Orden #${sessionCode}`,
          "Pago Confirmado",
        );
        router.push(`/user/orders/${sessionCode}`);
      } else if (errorMsg && errorMsg !== "Accept") {
        toast.error(
          `No se pudo completar el pago: ${errorMsg}`,
          "Pago Rechazado",
        );
      }
    }
  }, []);

  // Sincronizar email/nombre cuando el usuario inicie sesión
  useEffect(() => {
    if (user) {
      setShippingForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Persistir paso activo en LocalStorage
  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    if (typeof window !== "undefined") {
      localStorage.setItem(STEP_STORAGE_KEY, newStep.toString());
    }
  };

  // Persistir inputs del formulario en LocalStorage mientras se escribe
  const handleFormChange = (field: keyof ShippingFormState, value: string) => {
    const updated = { ...shippingForm, [field]: value };
    setShippingForm(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(updated));
    }
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
        const res = await fetch(
          `/api/products/recommendations?exclude=${excludeIds}&page=${pageToFetch}&limit=6`,
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
    [items],
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
      seller_id: bump.seller_id,
      images: bump.image_url ? [{ url: bump.image_url }] : [],
      stock: typeof bump.stock === "number" ? bump.stock : 10,
    });
    toast.success(`"${bump.title}" agregado al paquete`, "¡Producto Añadido!");
  };

  // Validaciones del formulario para avanzar al paso 3
  const handleProceedToStep3 = () => {
    if (
      !shippingForm.name.trim() ||
      !shippingForm.phone.trim() ||
      !shippingForm.email.trim() ||
      !shippingForm.address.trim()
    ) {
      toast.error(
        "Completa tu Nombre, Teléfono, Correo electrónico y Dirección para continuar.",
        "Datos incompletos",
      );
      return;
    }
    handleStepChange(3);
  };

  // Validación de datos de factura/boleta antes de abrir la pasarela Niubiz
  const validateInvoiceDetails = (): boolean => {
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
            canGoToStep3={items.length > 0 && Boolean(shippingForm.address)}
          />
        </div>

        {/* PASO 1: CARRITO Y ORDER BUMPS */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* Lista de Productos */}
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-[#f1f5f9] mb-4">
                  <h2 className="font-bold text-[#112237] text-base">
                    Productos en tu Carrito ({items.length})
                  </h2>
                  {items.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Vaciar carrito
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-[#cbd5e1] mx-auto mb-3" />
                    <p className="font-bold text-[#112237] text-sm">
                      Tu carrito está vacío
                    </p>
                    <p className="text-xs text-[#64748b] mt-1 mb-6">
                      Explora el catálogo y añade productos para continuar.
                    </p>
                    <Link
                      href="/search"
                      className="inline-flex items-center gap-2 bg-[#f25c05] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-[#d94d04] transition-all"
                    >
                      Explorar Productos
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#f1f5f9]">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="relative w-14 h-14 bg-[#f8fafc] rounded-2xl overflow-hidden border border-[#e2e8f0] shrink-0 flex items-center justify-center">
                            {item.image_url ? (
                              <Image
                                src={item.image_url}
                                alt={item.title}
                                fill
                                sizes="56px"
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <Package className="w-6 h-6 text-[#cbd5e1]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-[#112237] truncate">
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs font-bold text-[#f25c05]">
                                S/ {item.price.toFixed(2)}
                              </p>
                              {item.stock !== undefined && (
                                <span className="text-[10px] text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded font-medium">
                                  Stock: {item.stock} un.
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Control de Cantidad (- / +) */}
                        <div className="flex items-center gap-3 shrink-0">
                          <QuantitySelector
                            value={item.quantity}
                            onChange={(newQty) =>
                              updateQuantity(item.product_id, newQty)
                            }
                            max={
                              typeof item.stock === "number" && item.stock > 0
                                ? item.stock
                                : 99
                            }
                            size="sm"
                            showLimitWarning={true}
                          />

                          <button
                            onClick={() => removeItem(item.product_id)}
                            className="p-2 text-[#94a3b8] hover:text-red-500 transition-colors"
                            title="Eliminar ítem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Order Bumps / Productos Complementarios */}
              <CartOrderBumps
                recommendations={filteredRecommendations}
                loading={loadingRecs}
                onAddBump={handleAddBump}
                page={recsPage}
                hasMore={recsHasMore}
                onPageChange={(nextPage) => fetchRecommendations(nextPage)}
              />
            </div>

            {/* Sidebar Resumen */}
            <div className="lg:col-span-4">
              <CartSummarySidebar
                step={1}
                subtotal={total}
                shippingCost={shippingCost}
                grandTotal={grandTotal}
                itemCount={items.length}
                onNextStep={() => handleStepChange(2)}
              />
            </div>
          </div>
        )}

        {/* PASO 2: DATOS DE CONTACTO Y ENVÍO */}
        {step === 2 && (
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
                    onClick={() => setDeliveryType("progressive")}
                    className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      deliveryType === "progressive"
                        ? "border-[#f25c05] bg-orange-50"
                        : "border-[#e2e8f0] hover:border-[#f25c05]/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#112237]">
                        Entrega Progresiva
                      </p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">
                        Más rápido
                      </p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">
                        Conforme esté listo
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
                    onClick={() => setDeliveryType("complete")}
                    className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                      deliveryType === "complete"
                        ? "border-[#112237] bg-slate-50"
                        : "border-[#e2e8f0] hover:border-[#112237]/40"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#112237]">
                        Entrega Completa
                      </p>
                      <p className="text-[11px] text-[#94a3b8] font-medium mt-0.5">
                        Una sola entrega
                      </p>
                      <p className="text-[11px] text-[#94a3b8] mt-0.5">
                        Puede demorar más días
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
                        <strong>Compra como Invitado activa:</strong> No
                        necesitas registrarte ni crear contraseña para comprar.
                      </span>
                    </div>
                    <Link
                      href="/auth/login?redirectTo=/cart"
                      className="text-[#f25c05] font-bold hover:underline shrink-0 text-[11px]"
                    >
                      ¿Ya tienes cuenta? Iniciar sesión
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
                      value={shippingForm.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Ej: Juan Carlos Pérez"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112237] mb-1.5">
                      Teléfono / WhatsApp *
                    </label>
                    <Input
                      value={shippingForm.phone}
                      onChange={(e) =>
                        handleFormChange("phone", e.target.value)
                      }
                      placeholder="+51 999 999 999"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#112237] mb-1.5">
                      Correo Electrónico (para tu comprobante) *
                    </label>
                    <Input
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) =>
                        handleFormChange("email", e.target.value)
                      }
                      placeholder="ejemplo@correo.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#112237] mb-1.5">
                      Provincia / Distrito *
                    </label>
                    <Input
                      value={shippingForm.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                      placeholder="Lima, Miraflores"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112237] mb-1.5">
                    Dirección Completa de Entrega *
                  </label>
                  <Input
                    value={shippingForm.address}
                    onChange={(e) =>
                      handleFormChange("address", e.target.value)
                    }
                    placeholder="Av. Larco 1234, Dpto 501"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#112237] mb-1.5">
                    Referencia o Instrucciones de Entrega (Opcional)
                  </label>
                  <Textarea
                    value={shippingForm.notes}
                    onChange={(e) => handleFormChange("notes", e.target.value)}
                    placeholder="Frente al parque principal o entregar en portería..."
                    rows={3}
                  />
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#f1f5f9]">
                  <Button
                    variant="outline"
                    onClick={() => handleStepChange(1)}
                    className="text-xs font-semibold flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver al Carrito</span>
                  </Button>

                  <Button
                    onClick={handleProceedToStep3}
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
                itemCount={items.length}
              />
            </div>
          </div>
        )}

        {/* PASO 3: CONFIRMAR Y PAGO CON NIUBIZ */}
        {step === 3 && (
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
                  onInvoiceTypeChange={setInvoiceType}
                  docType={docType}
                  onDocTypeChange={setDocType}
                  invoiceDni={invoiceDni}
                  onDniChange={setInvoiceDni}
                  invoiceRuc={invoiceRuc}
                  onRucChange={setInvoiceRuc}
                  invoiceCompanyName={invoiceCompanyName}
                  onCompanyNameChange={setInvoiceCompanyName}
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

                <div className="pt-4 w-full">
                  <NiubizPayModal
                    amount={grandTotal}
                    cartItems={items}
                    shippingForm={shippingForm}
                    onValidate={validateInvoiceDetails}
                    invoiceDetails={{
                      doc_type: invoiceType,
                      identity_type:
                        invoiceType === "factura" ? "ruc" : docType,
                      identity_number:
                        invoiceType === "factura" ? invoiceRuc : invoiceDni,
                      legal_name:
                        invoiceType === "factura"
                          ? invoiceCompanyName
                          : shippingForm.name,
                      tax_address: shippingForm.address,
                    }}
                    onSuccess={(sessionCode) => {
                      toast.success(
                        "¡Pago autorizado con éxito por Niubiz! Tu pedido está confirmado.",
                        "¡Gracias por tu compra!",
                      );
                      clearCart();
                      if (typeof window !== "undefined") {
                        localStorage.removeItem(STEP_STORAGE_KEY);
                        localStorage.removeItem(FORM_STORAGE_KEY);
                      }
                      router.push(`/user/orders/${sessionCode}`);
                    }}
                    onError={(errorMessage) => {
                      toast.error(errorMessage, "Error al procesar el pago");
                    }}
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
        )}
      </main>

      <Footer />
    </div>
  );
}
