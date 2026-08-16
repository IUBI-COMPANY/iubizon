import Link from "next/link";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import {
  Building2,
  ShieldCheck,
  Zap,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";

export const metadata = {
  title: "¿Qué es IUBIZON? | Tecnología para Educar y Trabajar",
  description:
    "Conoce IUBIZON: La plataforma integral de tecnología, equipamiento audiovisual y computacional para empresas e instituciones educativas en Perú. RUC: 20614600374.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="bg-gradient-to-b from-[#112237] via-[#162a45] to-[#112237] text-white py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#f25c05_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="container relative z-10 text-center max-w-4xl mx-auto px-4">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-[#f25c05] font-extrabold text-xs px-4 py-1.5 rounded-full mb-6 shadow-sm backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Ecosistema Tecnológico B2B & E-Commerce</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-6">
              ¿Qué es <span className="text-[#f25c05]">IUBIZON</span>?
            </h1>

            <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8">
              La plataforma integral de tecnología, equipamiento audiovisual y
              mobiliario que conecta a instituciones educativas, empresas y
              profesionales con los mejores proveedores verificados del Perú.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs md:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-[#f25c05]/20 transition-all hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explorar Catálogo</span>
              </Link>
              <Link
                href="/help"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs md:text-sm px-6 py-3.5 rounded-xl backdrop-blur-md transition-all border border-white/10"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Centro de Ayuda</span>
              </Link>
            </div>
          </div>
        </section>

        <div className="container py-12 md:py-16 space-y-16 max-w-5xl">
          {/* SECCIÓN 1: LA PROBLEMÁTICA */}
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                El Desafío del Mercado
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#112237] mt-3">
                La Problemática que Solucionamos
              </h2>
              <p className="text-xs md:text-sm text-[#64748b] mt-2">
                Equipar una oficina, un aula o un proyecto corporativo solía ser
                un proceso lento, fragmentado e incierto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-3 hover:border-red-200 transition-all">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-bold">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#112237]">
                  Fragmentación & Pérdida de Tiempo
                </h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Buscar proveedores en distintos lugares para comprar un proyector
                  por un lado, el ecram por otro, los cables y soportes por
                  separado, duplicando costos y tiempos de gestión.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-3 hover:border-red-200 transition-all">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#112237]">
                  Informalidad & Falta de Respaldo
                </h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Riesgo de tratar con intermediarios sin garantía real, sin RUC
                  verificado ni emisión formal de boletas y facturas electrónicas
                  válidas para empresas e instituciones.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-3 hover:border-red-200 transition-all">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-bold">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-base text-[#112237]">
                  Dificultad en Paquetes Integrados
                </h3>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Falta de plataformas especializadas que permitan cotizar y
                  agrupar soluciones completas en un solo carrito con despacho
                  coordinado.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: LA SOLUCIÓN IUBIZON */}
          <section className="bg-white rounded-3xl border border-[#e2e8f0] p-6 md:p-10 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-black uppercase tracking-wider text-[#f25c05] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                Nuestra Solución
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#112237] mt-3">
                Lo que Brinda IUBIZON
              </h2>
              <p className="text-xs md:text-sm text-[#64748b] mt-2">
                Un ecosistema moderno diseñado para simplificar tus compras de
                tecnología de principio a fin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solución 1 */}
              <div className="flex items-start gap-4 p-5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                <div className="p-3 bg-[#f25c05] text-white rounded-xl shrink-0 shadow-sm">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-[#112237]">
                    Arma tu Paquete en Un Solo Carrito
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Permite seleccionar tu producto principal y agregar sus
                    complementos perfectos (soportes, cables, accesorios) para
                    realizar un único pago unificado.
                  </p>
                </div>
              </div>

              {/* Solución 2 */}
              <div className="flex items-start gap-4 p-5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                <div className="p-3 bg-[#f25c05] text-white rounded-xl shrink-0 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-[#112237]">
                    Empresas Verificadas & RUC Formal
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Todos los productos provienen de empresas verificadas con
                    RUC oficial, garantizando facturación electrónica y
                    cumplimiento estricto.
                  </p>
                </div>
              </div>

              {/* Solución 3 */}
              <div className="flex items-start gap-4 p-5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                <div className="p-3 bg-[#f25c05] text-white rounded-xl shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-[#112237]">
                    Asistencia Técnica Inteligente (AI)
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Fichas técnicas enriquecidas por Inteligencia Artificial
                    (Google Gemini AI) para redactar especificaciones precisas,
                    libres de redundancias.
                  </p>
                </div>
              </div>

              {/* Solución 4 */}
              <div className="flex items-start gap-4 p-5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]">
                <div className="p-3 bg-[#f25c05] text-white rounded-xl shrink-0 shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm text-[#112237]">
                    Protección al Comprador IUBIZON
                  </h3>
                  <p className="text-xs text-[#64748b] leading-relaxed">
                    Cobertura transparente y acompañamiento ante fallas de fábrica
                    o inconvenientes de entrega.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: MISIÓN, VISIÓN Y RAZÓN SOCIAL */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#112237] text-white rounded-3xl p-8 space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 bg-orange-500/20 text-[#f25c05] rounded-2xl flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Nuestra Misión</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transformar y agilizar la adquisición de tecnología en el Perú,
                ofreciendo un canal transparente, profesional e innovador donde
                empresas e instituciones encuentren las herramientas necesarias
                para educar y trabajar.
              </p>
            </div>

            <div className="bg-[#112237] text-white rounded-3xl p-8 space-y-4 shadow-sm relative overflow-hidden">
              <div className="w-12 h-12 bg-orange-500/20 text-[#f25c05] rounded-2xl flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Nuestra Visión</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ser el marketplace y plataforma B2B de referencia en el ámbito
                tecnológico y educativo en Latinoamérica, impulsando la digitalización
                con seguridad, inteligencia y confianza.
              </p>
            </div>
          </section>

          {/* BANNER RAZÓN SOCIAL */}
          <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-xs font-black uppercase text-[#f25c05] tracking-wider">
                Información Legal & Transparencia
              </p>
              <h4 className="text-lg font-black text-[#112237]">
                IUBIZON COMPANY S.A.C.
              </h4>
              <p className="text-xs text-[#64748b]">
                RUC: <strong className="text-[#112237]">20614600374</strong> — Domicilio Fiscal en Lima, Perú.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-md transition-all shrink-0"
            >
              <span>Ver Productos en IUBIZON</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
