"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

type OrderPackageSummary = {
  packageId: string;
  companyId: string;
  itemCount: number;
  productTitles: string[];
};

function PackageCard({
  pkg,
  index,
}: {
  pkg: OrderPackageSummary;
  index: number;
}) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 text-left space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f25c05]/10 text-[#f25c05] flex items-center justify-center shrink-0">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#112237]">
            Paquete {index + 1}
          </span>
        </div>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {pkg.itemCount} {pkg.itemCount === 1 ? "producto" : "productos"}
        </span>
      </div>
      <ul className="space-y-1 pt-1">
        {pkg.productTitles.map((title, i) => (
          <li
            key={i}
            className="text-[11px] text-[#475569] flex items-start gap-1.5"
          >
            <span className="text-[#f25c05] mt-0.5 shrink-0">·</span>
            <span>{title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order_code") || "";
  const [packages, setPackages] = useState<OrderPackageSummary[]>([]);
  const { clearCart } = useCart();
  const { user, isLoading } = useAuth();

  // Iniciar con URL segura para SSR (guest), actualizar en cliente cuando user está disponible
  const guestFallback = orderCode
    ? `/auth/login?redirect=${encodeURIComponent(`/user/orders/${orderCode}`)}`
    : "/auth/login?redirect=/user/orders";

  const [detailHref, setDetailHref] = useState(guestFallback);

  useEffect(() => {
    if (!isLoading) {
      setDetailHref(
        orderCode
          ? user
            ? `/user/orders/${orderCode}`
            : guestFallback
          : user
            ? "/user/orders"
            : guestFallback,
      );
    }
  }, [user, isLoading, orderCode, guestFallback]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    clearCart();
    localStorage.removeItem("iubizon_checkout_step");
    localStorage.removeItem("iubizon_checkout_form");

    try {
      const raw = sessionStorage.getItem("iubizon_order_packages");
      if (raw) {
        setPackages(JSON.parse(raw));
        sessionStorage.removeItem("iubizon_order_packages");
      }
    } catch {}
  }, [clearCart]);

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-8 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Pedido Registrado con Éxito
            </span>
            <h1 className="text-3xl font-extrabold text-[#112237] mt-3">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-sm text-[#64748b] mt-1 max-w-md mx-auto">
              Cada proveedor ha recibido la confirmación y preparará tu pedido
              para su despacho.
            </p>
          </div>
        </div>

        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 text-center">
          <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider">
            Código de Orden
          </p>
          <p className="text-2xl font-black text-[#f25c05] tracking-widest mt-1">
            #{orderCode}
          </p>
        </div>

        {packages.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#112237] uppercase tracking-wider">
              Despachos por Proveedor
            </p>
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.packageId} pkg={pkg} index={i} />
            ))}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
          <p className="font-bold text-blue-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4" />
            ¿Qué sigue ahora?
          </p>
          <ul className="space-y-2.5">
            {[
              "Recibirás un correo de confirmación con todos los detalles de tu pedido.",
              "Cada vendedor preparará tu pedido para el despacho.",
              "Recibirás actualizaciones con el código de seguimiento.",
              "Si tienes dudas, nuestro equipo de soporte está listo para ayudarte.",
            ].map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-blue-700"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-px shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href={detailHref}
            className="flex-1 text-center py-3 rounded-xl bg-[#f25c05] text-white font-bold text-sm hover:bg-[#d94d04] transition-colors"
          >
            <ShoppingBag className="w-4 h-4 inline-block mr-1.5" />
            Ver detalles de mi pedido
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center py-3 rounded-xl border border-[#e2e8f0] text-[#112237] font-bold text-sm hover:bg-[#f8fafc] transition-colors"
          >
            Seguir comprando
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-[#64748b]">
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            iubizon.company@gmail.com
          </span>
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            +51 972 300 301
          </span>
        </div>
      </div>
    </main>
  );
}

export default function CartSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#f25c05] animate-spin" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer categories={[]} />
    </div>
  );
}
