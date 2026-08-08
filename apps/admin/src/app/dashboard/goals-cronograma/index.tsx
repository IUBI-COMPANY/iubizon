import { useState } from "react";
import { CheckCircle2, Code, DollarSign, Download, Target } from "lucide-react";

export default function CronogramaIubizon() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const meses = [
    {
      num: 1,
      nombre: "Enero 2025",
      fase: "Preparación y Diagnóstico",
      actividades: [
        {
          tarea: "Auditoría completa del sitio web actual y plan de mejoras",
          responsable: "Tú (Programador)",
          dias: "1-5",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea:
            "Análisis de competencia (precios, servicios, posicionamiento)",
          responsable: "Gerencia",
          dias: "1-7",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Configurar Google Analytics y herramientas de seguimiento",
          responsable: "Tú (Programador)",
          dias: "5-10",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Crear banco de fotografías con celular/cámara disponible",
          responsable: "Marketing",
          dias: "10-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Definir presupuesto mensual para marketing (S/800-1000)",
          responsable: "Finanzas",
          dias: "1-3",
          prioridad: "Alta",
          costo: 0,
        },
      ],
      inversion: "S/ 0",
      kpi: "Línea base establecida: visitas web, cotizaciones, ventas",
    },
    {
      num: 2,
      nombre: "Febrero 2025",
      fase: "Optimización Digital (Sin Costo Tech)",
      actividades: [
        {
          tarea: "Desarrollar chatbot/WhatsApp Business automatizado",
          responsable: "Tú (Programador)",
          dias: "1-10",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Escribir 4 artículos de blog optimizados SEO",
          responsable: "Tú o freelancer",
          dias: "1-28",
          prioridad: "Alta",
          costo: 200,
        },
        {
          tarea: "Optimizar fichas de productos con mejor SEO",
          responsable: "Tú (Programador)",
          dias: "5-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Lanzar campaña Google Ads básica (S/500 presupuesto)",
          responsable: "Marketing Digital",
          dias: "10-28",
          prioridad: "Alta",
          costo: 500,
        },
        {
          tarea: "Crear base de datos de contactos empresariales (gratuito)",
          responsable: "Ventas",
          dias: "1-28",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 700",
      kpi: "+20% visitas web, +15% consultas WhatsApp",
    },
    {
      num: 3,
      nombre: "Marzo 2025",
      fase: "Lanzamiento Servicios Recurrentes",
      actividades: [
        {
          tarea: "Diseñar planes de mantenimiento preventivo (3 paquetes)",
          responsable: "Servicio Técnico",
          dias: "1-7",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Crear material digital con Canva (gratuito)",
          responsable: "Marketing",
          dias: "5-12",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Campaña email marketing a base existente (Mailchimp free)",
          responsable: "Tú (Programador)",
          dias: "10-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Visitas comerciales a 10 instituciones educativas",
          responsable: "Ventas",
          dias: "1-30",
          prioridad: "Alta",
          costo: 150,
        },
        {
          tarea: "Programar calculadora de ROI en sitio web",
          responsable: "Tú (Programador)",
          dias: "15-30",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 150",
      kpi: "3 contratos de mantenimiento firmados, +25% consultas",
    },
    {
      num: 4,
      nombre: "Abril 2025",
      fase: "Expansión de Productos y Alquiler",
      actividades: [
        {
          tarea: "Incorporar 2 proyectores adicionales para alquiler (usados)",
          responsable: "Compras",
          dias: "1-10",
          prioridad: "Media",
          costo: 1800,
        },
        {
          tarea: "Crear sección de alquiler en web (programar tú mismo)",
          responsable: "Tú (Programador)",
          dias: "1-15",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Grabar 2 videos testimoniales con celular",
          responsable: "Marketing",
          dias: "5-20",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Lanzar programa de referidos (5% descuento)",
          responsable: "Marketing/Ventas",
          dias: "10-15",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Publicar en redes sociales (orgánico, sin ads)",
          responsable: "Community Manager",
          dias: "1-30",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 1,800",
      kpi: "+30% ventas vs Enero, 2-3 alquileres concretados",
    },
    {
      num: 5,
      nombre: "Mayo 2025",
      fase: "Penetración Sector Corporativo",
      actividades: [
        {
          tarea: "Diseñar paquetes 'Sala de Reuniones Lista' (PDF digital)",
          responsable: "Ventas",
          dias: "1-7",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Contactar 20 empresas medianas por LinkedIn/email",
          responsable: "Ventas",
          dias: "1-31",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Crear landing page corporativa (programar tú mismo)",
          responsable: "Tú (Programador)",
          dias: "5-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Google Ads enfocado en sector corporativo",
          responsable: "Marketing Digital",
          dias: "10-31",
          prioridad: "Alta",
          costo: 600,
        },
        {
          tarea: "Desarrollar sistema de cotización online automática",
          responsable: "Tú (Programador)",
          dias: "10-25",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 600",
      kpi: "8 cotizaciones corporativas, +35% ventas vs Enero",
    },
    {
      num: 6,
      nombre: "Junio 2025",
      fase: "Consolidación y Análisis",
      actividades: [
        {
          tarea: "Análisis completo de resultados (ROI por canal)",
          responsable: "Gerencia",
          dias: "1-7",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Ajustar estrategias según métricas obtenidas",
          responsable: "Gerencia/Marketing",
          dias: "8-15",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Contactar 2 distribuidores potenciales en provincia",
          responsable: "Gerencia",
          dias: "1-30",
          prioridad: "Media",
          costo: 200,
        },
        {
          tarea: "Crear webinar gratuito en Zoom (guía de proyectores)",
          responsable: "Marketing/Técnico",
          dias: "10-20",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Campaña de reactivación por WhatsApp masivo (API)",
          responsable: "Tú (Programador)",
          dias: "15-30",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 200",
      kpi: "+40% ventas vs Enero, 15% clientes recurrentes",
    },
    {
      num: 7,
      nombre: "Julio 2025",
      fase: "Fortalecimiento de Marketing",
      actividades: [
        {
          tarea: "Campaña agresiva Google Ads + Facebook Ads",
          responsable: "Marketing Digital",
          dias: "1-31",
          prioridad: "Alta",
          costo: 1000,
        },
        {
          tarea: "Crear 10 reels/TikToks educativos (orgánico)",
          responsable: "Community Manager",
          dias: "5-31",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Desarrollar base de conocimiento/FAQ en web",
          responsable: "Tú (Programador)",
          dias: "5-25",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Implementar chat en vivo (Tawk.to gratuito)",
          responsable: "Tú (Programador)",
          dias: "15-30",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Contactar 15 colegios para oferta pre-campaña",
          responsable: "Ventas",
          dias: "1-31",
          prioridad: "Alta",
          costo: 150,
        },
      ],
      inversion: "S/ 1,150",
      kpi: "+45% ventas vs Enero, mejor mes hasta ahora",
    },
    {
      num: 8,
      nombre: "Agosto 2025",
      fase: "Diversificación de Servicios",
      actividades: [
        {
          tarea: "Lanzar servicio de instalación profesional",
          responsable: "Servicio Técnico",
          dias: "1-10",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Incorporar 3 pantallas de proyección (stock mínimo)",
          responsable: "Compras",
          dias: "1-15",
          prioridad: "Media",
          costo: 900,
        },
        {
          tarea: "Crear bundles digitales (proyector+pantalla+instalación)",
          responsable: "Ventas/Marketing",
          dias: "10-20",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Desarrollar programa de trade-in (calculadora en web)",
          responsable: "Tú (Programador)",
          dias: "5-25",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Sorteo en redes sociales (premio: servicio mantenimiento)",
          responsable: "Community Manager",
          dias: "15-31",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 900",
      kpi: "+50% ventas vs Enero, 8 bundles vendidos",
    },
    {
      num: 9,
      nombre: "Septiembre 2025",
      fase: "Fortalecimiento Institucional",
      actividades: [
        {
          tarea: "Investigar certificación Epson (costos y requisitos)",
          responsable: "Gerencia",
          dias: "1-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Crear videos tutoriales de uso para clientes (YouTube)",
          responsable: "Servicio Técnico",
          dias: "5-20",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Visitar 15 instituciones con oferta especial",
          responsable: "Ventas",
          dias: "1-30",
          prioridad: "Alta",
          costo: 200,
        },
        {
          tarea: "Implementar CRM gratuito (HubSpot Free o similar)",
          responsable: "Tú (Programador)",
          dias: "10-30",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Google Ads campaña educativa",
          responsable: "Marketing Digital",
          dias: "1-30",
          prioridad: "Alta",
          costo: 700,
        },
      ],
      inversion: "S/ 900",
      kpi: "+55% ventas vs Enero, 20% clientes recurrentes",
    },
    {
      num: 10,
      nombre: "Octubre 2025",
      fase: "Campaña Fin de Año Empresarial",
      actividades: [
        {
          tarea: "Lanzar campaña 'Equipa tu empresa 2026' (digital)",
          responsable: "Marketing/Ventas",
          dias: "1-31",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Google Ads + Facebook Ads intensivo",
          responsable: "Marketing Digital",
          dias: "1-31",
          prioridad: "Alta",
          costo: 1200,
        },
        {
          tarea: "Crear catálogo digital premium con Canva",
          responsable: "Marketing",
          dias: "5-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Negociar con proveedores descuentos por volumen",
          responsable: "Compras",
          dias: "1-20",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Email marketing masivo (200+ contactos)",
          responsable: "Marketing Digital",
          dias: "10-31",
          prioridad: "Alta",
          costo: 0,
        },
      ],
      inversion: "S/ 1,200",
      kpi: "+60% ventas vs Enero, peak pre-campaña escolar",
    },
    {
      num: 11,
      nombre: "Noviembre 2025",
      fase: "Black Friday y Cierre",
      actividades: [
        {
          tarea: "Preparar ofertas especiales Black Friday (sin costo)",
          responsable: "Gerencia/Marketing",
          dias: "1-10",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Campaña masiva Google + Facebook + Instagram Ads",
          responsable: "Marketing Digital",
          dias: "20-30",
          prioridad: "Alta",
          costo: 1500,
        },
        {
          tarea: "Activar colaboraciones con micro-influencers (canje)",
          responsable: "Marketing",
          dias: "1-15",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Promoción 2x1 en mantenimiento (sin costo adicional)",
          responsable: "Servicio Técnico",
          dias: "15-30",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Asegurar stock con proveedores (S/500 anticipo)",
          responsable: "Compras",
          dias: "1-15",
          prioridad: "Alta",
          costo: 500,
        },
      ],
      inversion: "S/ 2,000",
      kpi: "+70% ventas vs Enero, mejor mes del año",
    },
    {
      num: 12,
      nombre: "Diciembre 2025",
      fase: "Evaluación y Planificación 2026",
      actividades: [
        {
          tarea: "Análisis completo de resultados anuales (dashboard)",
          responsable: "Gerencia",
          dias: "1-15",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Encuesta de satisfacción digital (Google Forms)",
          responsable: "Marketing",
          dias: "1-20",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Planificación estratégica 2026 con metas ajustadas",
          responsable: "Gerencia",
          dias: "10-30",
          prioridad: "Alta",
          costo: 0,
        },
        {
          tarea: "Campaña de agradecimiento por WhatsApp/email",
          responsable: "Marketing",
          dias: "15-31",
          prioridad: "Media",
          costo: 0,
        },
        {
          tarea: "Negociar contratos 2026 con mejores condiciones",
          responsable: "Compras",
          dias: "1-20",
          prioridad: "Media",
          costo: 0,
        },
      ],
      inversion: "S/ 0",
      kpi: "Meta anual: +45-55% facturación vs 2024",
    },
  ];

  const resumenInversion = {
    total: "S/ 10,000",
    marketing: "S/ 5,700",
    tecnologia: "S/ 0 (Tú lo haces)",
    inventario: "S/ 3,400",
    operaciones: "S/ 900",
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 print:shadow-none">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Plan de Crecimiento iubizon
              </h1>
              <p className="text-xl text-gray-600">
                Cronograma Optimizado 2025 - Inversión S/ 10,000
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Proyección: +45-55% crecimiento anual
              </p>
              <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
                <Code size={16} />
                <span className="font-semibold">
                  Ahorro en Tecnología: Tú programas todo = S/ 0
                </span>
              </div>
            </div>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition print:hidden"
            >
              <Download size={20} />
              Exportar PDF
            </button>
          </div>

          {/* Resumen de Inversión */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
              <DollarSign className="mb-2" size={24} />
              <p className="text-sm opacity-90">Inversión Total</p>
              <p className="text-2xl font-bold">{resumenInversion.total}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <Target className="mb-2" size={24} />
              <p className="text-sm opacity-90">Marketing/Ads</p>
              <p className="text-2xl font-bold">{resumenInversion.marketing}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <Code className="mb-2" size={24} />
              <p className="text-sm opacity-90">Tecnología</p>
              <p className="text-2xl font-bold line-through opacity-75">
                S/ 8,500
              </p>
              <p className="text-xl font-bold">{resumenInversion.tecnologia}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <CheckCircle2 className="mb-2" size={24} />
              <p className="text-sm opacity-90">Inventario + Ops</p>
              <p className="text-2xl font-bold">
                S/{" "}
                {parseInt(resumenInversion.inventario.replace(/[^\d]/g, "")) +
                  parseInt(resumenInversion.operaciones.replace(/[^\d]/g, ""))}
              </p>
            </div>
          </div>

          {/* Ventaja Competitiva */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Code className="text-green-600" size={20} />
              Tu Ventaja: Eres Programador
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mt-3 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <p className="font-semibold text-gray-900">
                  ✅ Chatbot/WhatsApp Bot
                </p>
                <p className="text-gray-600">Ahorro: ~S/ 1,500</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="font-semibold text-gray-900">
                  ✅ Sistema de Cotización
                </p>
                <p className="text-gray-600">Ahorro: ~S/ 2,000</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="font-semibold text-gray-900">
                  ✅ CRM + Herramientas
                </p>
                <p className="text-gray-600">Ahorro: ~S/ 5,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline de Meses */}
        <div className="space-y-6">
          {meses.map((mes) => (
            <div
              key={mes.num}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow print:break-inside-avoid print:shadow-none"
            >
              <div
                className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 cursor-pointer"
                onClick={() =>
                  setSelectedMonth(selectedMonth === mes.num ? null : mes.num)
                }
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm font-bold">
                        Mes {mes.num}
                      </span>
                      <h2 className="text-2xl font-bold">{mes.nombre}</h2>
                    </div>
                    <p className="text-lg opacity-95">{mes.fase}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">Inversión</p>
                    <p className="text-2xl font-bold">{mes.inversion}</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-6 ${selectedMonth === mes.num || (typeof window !== "undefined" && window.matchMedia("print").matches) ? "block" : "hidden print:block"}`}
              >
                {/* Actividades */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="text-indigo-600" size={20} />
                    Actividades del Mes
                  </h3>
                  <div className="space-y-3">
                    {mes.actividades.map((act, idx) => (
                      <div
                        key={idx}
                        className="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-indigo-50 transition rounded-r"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-gray-900 flex-1">
                            {act.tarea}
                          </p>
                          <div className="flex gap-2 items-center ml-2">
                            {act.costo === 0 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                                GRATIS
                              </span>
                            )}
                            {act.costo > 0 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                S/ {act.costo}
                              </span>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                act.prioridad === "Alta"
                                  ? "bg-red-100 text-red-700"
                                  : act.prioridad === "Media"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-green-100 text-green-700"
                              }`}
                            >
                              {act.prioridad}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>👤 {act.responsable}</span>
                          <span>📅 Días {act.dias}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPI Esperado */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="text-green-600" size={20} />
                    KPI Objetivo del Mes
                  </h3>
                  <p className="text-gray-700">{mes.kpi}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer con Notas */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8 print:shadow-none print:break-before-page">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Estrategia de Inversión Optimizada
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
              <h4 className="font-bold text-gray-900 mb-2">
                💰 Distribución de S/ 10,000
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>Marketing Digital (57%):</strong> S/ 5,700 - Google
                  Ads, Facebook Ads
                </li>
                <li>
                  • <strong>Inventario (34%):</strong> S/ 3,400 - Proyectores
                  para alquiler, pantallas
                </li>
                <li>
                  • <strong>Operaciones (9%):</strong> S/ 900 - Visitas
                  comerciales, movilidad
                </li>
                <li>
                  • <strong>Tecnología:</strong> S/ 0 - Tú lo programas todo
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
              <h4 className="font-bold text-gray-900 mb-2">
                🚀 Herramientas que Programarás
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>
                  • <strong>Chatbot WhatsApp:</strong> Respuestas automáticas
                  24/7
                </li>
                <li>
                  • <strong>Sistema de Cotización:</strong> Formulario
                  inteligente con PDF
                </li>
                <li>
                  • <strong>Calculadora ROI:</strong> Para equipos nuevos vs
                  reacondicionados
                </li>
                <li>
                  • <strong>CRM Básico:</strong> Seguimiento de leads y ventas
                </li>
                <li>
                  • <strong>Panel Analytics:</strong> Dashboard de métricas en
                  tiempo real
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3 text-gray-700">
            <p>
              ✅ <strong>Prioridad:</strong> Enfoque en marketing digital
              (Google/Facebook Ads) para máxima visibilidad con bajo
              presupuesto.
            </p>
            <p>
              ✅ <strong>Crecimiento Orgánico:</strong> Uso intensivo de redes
              sociales, SEO y contenido educativo sin costo.
            </p>
            <p>
              ✅ <strong>ROI Esperado:</strong> Con S/ 10,000 invertidos
              estratégicamente, proyección de +45-55% en facturación anual.
            </p>
            <p>
              ✅ <strong>Herramientas Gratuitas:</strong> Google Analytics,
              Canva, Mailchimp Free, Tawk.to, HubSpot Free CRM.
            </p>
            <p>
              ✅ <strong>Reinversión:</strong> A partir del mes 4, reinvertir
              ganancias en más stock de alquiler y publicidad.
            </p>
          </div>

          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-900">
              <strong>📞 Contacto iubizon:</strong> WhatsApp 972 300 301 |
              <a href="https://iubizon.com" className="underline ml-1">
                iubizon.com
              </a>
            </p>
          </div>
        </div>

        {/* Instrucciones de Impresión */}
        <div className="print:hidden bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6 rounded-r">
          <p className="text-sm text-yellow-900">
            💡 <strong>Tip:</strong> Para exportar a PDF, haz clic en "Exportar
            PDF" y selecciona "Guardar como PDF" en la ventana de impresión.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
