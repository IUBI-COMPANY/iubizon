"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Button } from "@/components/ui/Button";
import {
  HelpCircle,
  ShoppingBag,
  Store,
  ShieldCheck,
  FileText,
  Lock,
  ChevronRight,
  Package,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

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

  const navItems = [
    { id: "comprar", label: "Cómo Comprar", icon: ShoppingBag },
    { id: "vender", label: "Cómo Vender", icon: Store },
    { id: "seguridad", label: "Seguridad & Garantía", icon: ShieldCheck },
    { id: "terminos", label: "Términos y Condiciones", icon: FileText },
    { id: "privacidad", label: "Política de Privacidad", icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      {/* Header Banner */}
      <div className="bg-[#112237] text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <HelpCircle className="w-80 h-80 text-white" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10">
          <Link href="/apps/web/public">
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

      {/* Main Container */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Menú Lateral */}
          <div className="md:col-span-1 space-y-1">
            <p className="text-[11px] font-bold text-[#64748b] uppercase tracking-wider px-3 mb-2">
              Secciones
            </p>
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? "bg-[#112237] text-white shadow-sm"
                      : "bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#f25c05] hover:text-[#112237]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp
                      className={`w-4 h-4 ${
                        isActive ? "text-[#f25c05]" : "text-[#94a3b8]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${
                      isActive ? "text-white" : "text-[#cbd5e1]"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Área de Contenido Detallado */}
          <div className="md:col-span-3 bg-white border border-[#e2e8f0] rounded-3xl p-6 sm:p-8 shadow-xs">
            {/* Pestaña: Cómo Comprar */}
            {activeTab === "comprar" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#f1f5f9] pb-4">
                  <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#f25c05]" />
                    Guía de Compra & Armado de Paquetes
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Aprende cómo adquirir equipamiento tecnológico y armar tus
                    combos ideales para tu empresa u hogar.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">
                      1
                    </div>
                    <h3 className="font-extrabold text-sm text-[#112237]">
                      Arma tu Set o Paquete Tecnológico
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Selecciona productos complementarios (Laptops,
                      Proyectores, Impresoras o Accesorios) y agrégalos a tu
                      paquete en un solo pago unificado.
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">
                      2
                    </div>
                    <h3 className="font-extrabold text-sm text-[#112237]">
                      Cotización Oficial en PDF
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      ¿Necesitas aprobación en tu institución o empresa? Genera
                      y descarga al instante una Cotización con RUC emitida por{" "}
                      <strong>IUBIZON COMPANY S.A.C.</strong>
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">
                      3
                    </div>
                    <h3 className="font-extrabold text-sm text-[#112237]">
                      Pasarela de Pagos 100% Segura
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Paga mediante tarjetas de crédito o débito a través de
                      Niubiz con encriptación bancaria de alta seguridad.
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-4 space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f25c05] flex items-center justify-center font-black text-sm">
                      4
                    </div>
                    <h3 className="font-extrabold text-sm text-[#112237]">
                      Despacho & Seguimiento
                    </h3>
                    <p className="text-xs text-[#64748b]">
                      Monitorea el estado de tu pedido desde tu panel de usuario
                      hasta recibirlo con garantía oficial de marca.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Cómo Vender */}
            {activeTab === "vender" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#f1f5f9] pb-4">
                  <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#f25c05]" />
                    Vender en iubizon (Empresas y Vendedores)
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Conecta tus productos tecnológicos con miles de compradores
                    institucionales y personas en todo el Perú.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-[#475569]">
                  <div className="flex items-start gap-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                    <Building2 className="w-5 h-5 text-[#f25c05] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#112237] block mb-0.5 text-sm">
                        Crea tu Perfil de Empresa
                      </strong>
                      Registra tu marca o empresa con RUC, personaliza tu
                      catálogo comercial y gestiona tu equipo de trabajo de
                      forma independiente.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                    <CreditCard className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#112237] block mb-0.5 text-sm">
                        Cobros y Transferencias Bancarias Directas
                      </strong>
                      Registra tu cuenta de ahorros o cuenta corriente (BCP,
                      Interbank, BBVA, etc.) en el panel de finanzas. Iubizon
                      liquida y transfiere tus ventas de forma transparente.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                    <Package className="w-5 h-5 text-[#f25c05] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#112237] block mb-0.5 text-sm">
                        Gestión de Pedidos & Despachos
                      </strong>
                      Recibe notificaciones inmediatas ante cada venta,
                      actualiza el código de seguimiento del envío y mantén la
                      reputación de tu tienda alta.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Seguridad & Garantía */}
            {activeTab === "seguridad" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#f1f5f9] pb-4">
                  <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#f25c05]" />
                    Protección iubizon & Garantías
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Compostura legal y técnica diseñada para respaldar cada
                    transacción comercial en la plataforma.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-[#475569]">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                    <h3 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Protección en Compras y Garantía de Fábrica
                    </h3>
                    <p>
                      Todos los productos comercializados cuentan con respaldo y
                      garantía oficial contra fallas de fabricación. iubizon
                      facilita la mediación directa para que recibas el producto
                      exacto prometido.
                    </p>
                  </div>

                  <div className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl space-y-1">
                    <h3 className="font-extrabold text-sm text-[#112237]">
                      Prevención contra Transacciones Fraudulentas
                    </h3>
                    <p>
                      Auditamos las solicitudes de venta y las empresas
                      asociadas para garantizar que los pagos procesados sean
                      legítimos, protegiendo tanto los fondos del comprador como
                      las retribuciones del vendedor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Términos y Condiciones */}
            {activeTab === "terminos" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#f1f5f9] pb-4">
                  <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#f25c05]" />
                    Términos y Condiciones de Uso
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Última actualización: 2026. Documento regulador de servicios
                    para la plataforma iubizon.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#112237] mb-1">
                      1. Aceptación del Servicio
                    </h3>
                    <p>
                      Al acceder, explorar o realizar compras a través del sitio
                      web iubizon.com, el usuario acepta de manera íntegra los
                      presentes Términos y Condiciones administrados por{" "}
                      <strong>IUBIZON COMPANY S.A.C.</strong> (RUC 20614600374).
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#112237] mb-1">
                      2. Rol de la Plataforma y Responsabilidad de Catálogo
                    </h3>
                    <p>
                      iubizon opera como una plataforma tecnológica conector
                      entre empresas comercializadoras, marcas y compradores.
                      Los vendedores son los únicos responsables del estado
                      físico, especificaciones y stock real de los productos
                      publicados. iubizon se reserva el derecho de retirar
                      cualquier publicación que no cumpla los estándares de
                      calidad.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#112237] mb-1">
                      3. Pagos, Precios y Comisiones
                    </h3>
                    <p>
                      Todos los precios están expresados en Soles (S/) e
                      incluyen los impuestos de ley (IGV) salvo que se
                      especifique lo contrario. iubizon procesa las
                      transacciones a través de pasarelas reguladas. El cobro
                      por servicio o comisión por uso de plataforma es retenido
                      automáticamente según las condiciones pactadas con cada
                      vendedor.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#112237] mb-1">
                      4. Suspensión de Cuentas por Incumplimiento
                    </h3>
                    <p>
                      iubizon se reserva la facultad discrecional de suspender
                      temporal o definitivamente la cuenta de cualquier usuario
                      o empresa que intente realizar maniobras fraudulentas,
                      suplantación de identidad o incumplimiento reiterado en
                      las entregas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Política de Privacidad */}
            {activeTab === "privacidad" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-[#f1f5f9] pb-4">
                  <h2 className="text-xl font-black text-[#112237] flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#f25c05]" />
                    Política de Privacidad de Datos
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1">
                    Protección de datos personales conforme a la Ley N° 29733
                    del Perú.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-[#475569] leading-relaxed">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#112237] mb-1">
                      Tratamiento de la Información
                    </h3>
                    <p>
                      <strong>IUBIZON COMPANY S.A.C.</strong> recopila datos
                      como nombres, documento de identidad, dirección de entrega
                      y correo electrónico con el único fin de procesar
                      transacciones comerciales, emitir cotizaciones y coordinar
                      la entrega de productos.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#112237] mb-1">
                      Seguridad y Confidencialidad
                    </h3>
                    <p>
                      Tus datos personales no son comercializados con terceros.
                      La información financiera o de tarjetas es procesada
                      directamente por pasarelas certificadas con cifrado SSL
                      sin ser almacenada en nuestros servidores.
                    </p>
                  </div>
                </div>
              </div>
            )}
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
