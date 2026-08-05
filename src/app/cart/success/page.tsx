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

type TrackingGroup = {
  sellerId: string;
  trackingCode: string;
  productCount: number;
  productTitles: string[];
};

function TrackingGroupCard({
  group,
  index,
}: {
  group: TrackingGroup;
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
            Envío {index + 1} — Proveedor
          </span>
        </div>
        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {group.productCount}{" "}
          {group.productCount === 1 ? "producto" : "productos"}
        </span>
      </div>

      <ul className="space-y-1 pt-1">
        {group.productTitles.map((title, i) => (
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
  const [trackingGroups, setTrackingGroups] = useState<TrackingGroup[]>([]);
  const { clearCart } = useCart();
  const { user, isLoading } = useAuth();
  const detailHref = orderCode
    ? user
      ? `/user/orders/${orderCode}`
      : `/auth/login?redirect=${encodeURIComponent(`/user/orders/${orderCode}`)}`
    : user
      ? "/user/orders"
      : "/auth/login?redirect=/user/orders";

  useEffect(() => {
    if (typeof window === "undefined") return;
    clearCart();
    localStorage.removeItem("iubizon_checkout_step");
    localStorage.removeItem("iubizon_checkout_form");

    try {
      const raw = sessionStorage.getItem("iubizon_tracking_groups");
      if (raw) {
        setTrackingGroups(JSON.parse(raw));
        sessionStorage.removeItem("iubizon_tracking_groups");
      }
    } catch {
      // silently ignore parse errors
    }
  }, [clearCart]);

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-8 shadow-xl space-y-6">
        {/* Header */}
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
              Cada proveedor ha recibido la confirmación de tu pago y preparará
              tu pedido para su despacho.
            </p>
          </div>
        </div>

        {/* Código de sesión */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 text-center">
          <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider">
            Código de Orden
          </p>
          <p className="text-2xl font-black text-[#f25c05] tracking-widest mt-1">
            #{orderCode}
          </p>
        </div>

        {/* Grupos de tracking */}
        {trackingGroups.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-[#112237] uppercase tracking-wider">
              Despachos por Proveedor
            </p>
            {trackingGroups.map((group, i) => (
              <TrackingGroupCard
                key={group.trackingCode}
                group={group}
                index={i}
              />
            ))}
          </div>
        )}

        {/* Siguiente paso */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#112237]">
            <Clock className="w-4 h-4 text-[#f25c05]" />
            <span>Siguiente Paso:</span>
          </div>
          <ul className="text-xs text-[#475569] space-y-2 list-disc list-inside">
            <li>Cada proveedor notificará el despacho de sus productos.</li>
            <li>
              Podrás consultar el avance por código de tracking en tu panel.
            </li>
            <li>
              Tu pago se procesó con éxito y recibirás notificaciones en tiempo
              real sobre tu envío.
            </li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-3">
          <p className="text-xs font-bold text-[#112237] uppercase tracking-wider">
            Importante
          </p>
          <p className="text-xs text-[#475569]">
            Revisa tu correo para confirmar los detalles de tu compra. Si tienes
            algún problema, contáctanos por soporte:
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <a
              href="mailto:iubizon.company@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#112237] hover:text-[#f25c05]"
            >
              <Mail className="w-3.5 h-3.5" />
              iubizon.company@gmail.com
            </a>
            <a
              href="https://wa.me/51972300301?text=Hola%20iubizon%20necesito%20asistencia"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#112237] hover:text-[#f25c05]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp: +51 972 300 301
            </a>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={detailHref}
            className="w-full sm:w-auto bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {isLoading
                ? "Abriendo detalle..."
                : user
                  ? `Ver Detalle del Pedido #${orderCode || ""}`
                  : "Iniciar sesión para ver tu pedido"}
            </span>
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto bg-white border border-[#e2e8f0] text-[#334155] hover:bg-slate-50 font-semibold px-6 py-3.5 rounded-xl transition-colors text-xs text-center"
          >
            Seguir Comprando
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CartSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  );
}
