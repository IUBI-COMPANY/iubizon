"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("order_code") || "IUBI-982104";

  return (
    <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-8 shadow-xl text-center space-y-6">
        {/* Icono de Éxito */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            ¡Pedido Registrado con Éxito!
          </span>
          <h1 className="text-3xl font-extrabold text-[#112237] mt-3">
            ¡Gracias por tu compra!
          </h1>
          <p className="text-sm text-[#64748b] mt-1 max-w-md mx-auto">
            Tu pedido ha sido asignado a la empresa proveedora para su preparación y despacho contra entrega.
          </p>
        </div>

        {/* Código de Orden */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 max-w-sm mx-auto">
          <p className="text-xs text-[#64748b] font-semibold uppercase tracking-wider">
            Código de Orden Interna
          </p>
          <p className="text-2xl font-black text-[#f25c05] tracking-widest mt-1">
            #{orderCode}
          </p>
        </div>

        {/* Estado y Siguiente Paso dentro de iubizon */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#112237]">
            <Clock className="w-4 h-4 text-[#f25c05]" />
            <span>Siguiente Paso en la Plataforma:</span>
          </div>
          <ul className="text-xs text-[#475569] space-y-2 list-disc list-inside">
            <li>La empresa notificará el despacho de tus productos.</li>
            <li>Podrás consultar el avance de la entrega en tu panel de usuario.</li>
            <li>Pagarás en efectivo, Yape o Plin únicamente al recibir tu producto.</li>
          </ul>
        </div>

        {/* Botón Principal: Ver Mi Pedido en la Plataforma */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/user/dashboard?view=personal"
            className="w-full sm:w-auto bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Mi Pedido en la Plataforma ➔</span>
          </Link>
          <Link
            href="/products"
            className="w-full sm:w-auto bg-white border border-[#e2e8f0] text-[#334155] hover:bg-slate-50 font-semibold px-6 py-3.5 rounded-xl transition-colors text-xs"
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
