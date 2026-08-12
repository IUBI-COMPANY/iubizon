"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import { HelpCircle, ArrowLeft } from "lucide-react";

import { HelpSidebar } from "./components/HelpSidebar";
import { BuySection } from "./components/BuySection";
import { SellSection } from "./components/SellSection";
import { SecuritySection } from "./components/SecuritySection";
import { TermsSection } from "./components/TermsSection";
import { PrivacySection } from "./components/PrivacySection";

function HelpContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "comprar";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      {/* Header Banner Original */}
      <div className="bg-[#112237] text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <HelpCircle className="w-80 h-80 text-white" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white hover:bg-white/10 mb-4 rounded-xl text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Volver al Inicio
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-[#f25c05] text-white rounded-xl shadow-sm">
              <HelpCircle className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Centro de Información & Ayuda iubizon
            </h1>
          </div>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mt-1">
            Encuentra aquí todo sobre el funcionamiento de nuestra plataforma,
            guías de compra, beneficios para empresas vendedores, seguridad y
            normas legales.
          </p>
        </div>
      </div>

      {/* Main Container Original Grid (1/4 y 3/4) */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Menú Lateral Original (Botones) */}
          <HelpSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Área de Contenido Detallado Original */}
          <div className="md:col-span-3 bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs">
            {activeTab === "comprar" && <BuySection />}
            {activeTab === "vender" && <SellSection />}
            {activeTab === "seguridad" && <SecuritySection />}
            {activeTab === "terminos" && <TermsSection />}
            {activeTab === "privacidad" && <PrivacySection />}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="w-8 h-8 border-4 border-[#f25c05] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <HelpContent />
    </Suspense>
  );
}
