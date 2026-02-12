"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
  Wrench,
} from "lucide-react";

export default function TechnicalServicePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Servicio Técnico de Proyectores para Personas y Organizaciones",
    description:
      "Servicio técnico especializado de proyectores para personas y organizaciones en Lima y todo Perú. Mantenimiento preventivo, reparación de proyectores Epson, Sony, BenQ, diagnóstico gratuito y soporte técnico profesional con garantía.",
    provider: {
      "@type": "Organization",
      name: "iubizon",
      url: "https://www.iubizon.com",
      logo: "https://www.iubizon.com/images/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+51-972-300-301",
        contactType: "customer service",
        areaServed: "PE",
        availableLanguage: "Spanish",
      },
    },
    serviceType: "Mantenimiento y Reparación de Proyectores",
    areaServed: {
      "@type": "City",
      name: "Lima",
      containedIn: {
        "@type": "Country",
        name: "Perú",
      },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios Técnicos",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Servicio Técnico para Personas Naturales",
            description:
              "Servicio personalizado para usuarios individuales, hogares y pequeños proyectos con atención a domicilio en Lima",
            serviceOutput: [
              "Atención personalizada y directa",
              "Servicio a domicilio en Lima",
              "Presupuesto gratuito sin compromiso",
              "Garantía de 6 meses en reparaciones",
            ],
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Servicio Técnico para Organizaciones",
            description:
              "Soluciones integrales para empresas privadas, colegios, institutos, universidades, iglesias, centros educativos, auditorios y organizaciones con contratos de mantenimiento preventivo",
            serviceOutput: [
              "Contratos de mantenimiento preventivo",
              "Atención prioritaria y soporte técnico",
              "Facturación electrónica disponible",
              "Descuentos por volumen y contratos",
            ],
            audience: [
              {
                "@type": "Audience",
                audienceType: "Empresas Privadas",
              },
              {
                "@type": "Audience",
                audienceType: "Colegios",
              },
              {
                "@type": "Audience",
                audienceType: "Institutos",
              },
              {
                "@type": "Audience",
                audienceType: "Universidades",
              },
              {
                "@type": "Audience",
                audienceType: "Iglesias",
              },
              {
                "@type": "Audience",
                audienceType: "Centros Educativos",
              },
              {
                "@type": "Audience",
                audienceType: "Oficinas Corporativas",
              },
              {
                "@type": "Audience",
                audienceType: "Auditorios",
              },
              {
                "@type": "Audience",
                audienceType: "Organizaciones sin fines de lucro",
              },
            ],
          },
        },
      ],
    },
    brand: ["Epson", "Sony", "BenQ", "Optoma", "Panasonic"],
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://www.iubizon.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Servicios",
        item: "https://www.iubizon.com/servicios",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Servicio Técnico",
        item: "https://www.iubizon.com/servicios/tecnico",
      },
    ],
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Ofrecen servicio técnico de proyectores para personas y organizaciones?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, ofrecemos servicio técnico especializado tanto para personas naturales (B2C) como para organizaciones (B2B). Para personas ofrecemos atención personalizada con servicio a domicilio en Lima. Para organizaciones atendemos empresas privadas, colegios, institutos, universidades, iglesias, centros educativos, auditorios y organizaciones sin fines de lucro con contratos de mantenimiento preventivo y soporte técnico prioritario.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto tiempo de garantía tienen las reparaciones?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Todas nuestras reparaciones incluyen 6 meses de garantía. Tu inversión está protegida y respaldamos completamente nuestro trabajo técnico especializado.",
        },
      },
      {
        "@type": "Question",
        name: "¿Atienden servicio técnico de proyectores a domicilio en Lima?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, ofrecemos servicio técnico de proyectores a domicilio en Lima tanto para personas naturales como para empresas. Respondemos a tu solicitud en menos de 24 horas y contamos con técnicos especializados.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué marcas de proyectores reparan?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Reparamos todas las marcas de proyectores incluyendo Epson, Sony, BenQ, Optoma, Panasonic y más. Nuestros técnicos están certificados y cuentan con años de experiencia en mantenimiento preventivo y reparación especializada.",
        },
      },
      {
        "@type": "Question",
        name: "¿Ofrecen contratos de mantenimiento para empresas?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, ofrecemos contratos de mantenimiento preventivo personalizados para todo tipo de organizaciones: empresas privadas, colegios, institutos, universidades, iglesias, centros educativos, auditorios y organizaciones sin fines de lucro. Incluyen atención prioritaria, soporte técnico dedicado, facturación electrónica y descuentos por volumen.",
        },
      },
      {
        "@type": "Question",
        name: "¿Atienden colegios, institutos y universidades?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, contamos con amplia experiencia atendiendo instituciones educativas en Lima y todo Perú. Ofrecemos servicio técnico especializado para colegios, institutos, universidades y centros de capacitación con contratos de mantenimiento preventivo, atención prioritaria y descuentos especiales para el sector educativo.",
        },
      },
    ],
  };

  return (
    <main className="min-h-screen">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      {/* Hero Section */}
      <section className="relative text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/servicio tecnico retail y organizaciones.png"
            alt="Servicio técnico para empresas y retail"
            fill
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-black/70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
              Servicio Técnico de Proyectores para Personas y Organizaciones
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Mantenimiento preventivo y reparación profesional de proyectores
              para personas naturales y organizaciones en Lima y todo Perú
            </p>
            <p className="text-lg text-white/80 mb-12">
              Servicio técnico especializado con garantía - Selecciona el tipo
              de servicio que necesitas
            </p>
          </div>

          {/* Options Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mt-12">
            {/* Persona Natural Card */}
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(233,78,27,0.3)] border-2 border-transparent hover:border-[#E94E1B]/20">
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#E94E1B]/10 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-[#E94E1B]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-4">
                  Persona Natural
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Servicio personalizado para usuarios individuales, hogares y
                  pequeños proyectos
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Atención personalizada y directa
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Servicio a domicilio en Lima
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Presupuesto gratuito sin compromiso
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Garantía de 6 meses en reparaciones
                    </span>
                  </li>
                </ul>
                <Link href="/servicios/tecnico/persona" className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white shadow-lg hover:shadow-xl transition-all"
                    styleVariant="solid"
                  >
                    <div className="flex gap-2 flex-wrap">
                      <span>Solicitar Servicio</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Organización Card */}
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_rgba(16,34,57,0.3)] border-2 border-transparent hover:border-[#102239]/20">
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-[#102239]/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-[#102239]" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-4">
                  Organización
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Soluciones integrales para empresas privadas, colegios,
                  institutos, universidades, iglesias y centros educativos
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Contratos de mantenimiento preventivo
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Atención prioritaria y soporte técnico
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Facturación electrónica disponible
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Descuentos por volumen y contratos
                    </span>
                  </li>
                </ul>
                <Link href="/servicios/tecnico/organizacion" className="block">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-white shadow-lg hover:shadow-xl transition-all"
                    styleVariant="solid"
                  >
                    <div className="flex gap-2 flex-wrap">
                      <span>Solicitar Cotización</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2C Section - Servicio para Personas */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Servicio Técnico de Proyectores para Personas Naturales en Lima
                (B2C)
              </h2>
              <p className="text-xl text-gray-600">
                Reparación y mantenimiento de proyectores a domicilio - Cuidamos
                tu proyector como si fuera nuestro
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
              <div>
                <Image
                  src="/images/servicios/tecnicos.png"
                  alt="Servicio técnico de proyectores para personas naturales en Lima - Reparación y mantenimiento a domicilio"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ¿Por qué elegirnos?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Respuesta Rápida
                      </h4>
                      <p className="text-gray-600">
                        Atendemos tu solicitud en menos de 24 horas. Servicio a
                        domicilio disponible en Lima.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Garantía Extendida
                      </h4>
                      <p className="text-gray-600">
                        6 meses de garantía en todas nuestras reparaciones. Tu
                        inversión está protegida.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Wrench className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Expertos Certificados
                      </h4>
                      <p className="text-gray-600">
                        Técnicos especializados con años de experiencia en todas
                        las marcas de proyectores.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Nuestros Servicios para Ti
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wrench className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Reparación
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Diagnóstico gratuito y reparación de cualquier falla en tu
                    proyector
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Mantenimiento
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Limpieza profunda y mantenimiento preventivo para alargar la
                    vida útil
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Instalación
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Instalación profesional y configuración óptima en tu hogar u
                    oficina
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B2B Section - Servicio para Organizaciones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Servicio Técnico de Proyectores para Organizaciones y Empresas
                en Lima (B2B)
              </h2>
              <p className="text-xl text-gray-600">
                Mantenimiento preventivo y soporte técnico integral para
                empresas e instituciones educativas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center mb-12">
              <div className="order-2 md:order-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Soluciones Empresariales
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Contratos de Mantenimiento
                      </h4>
                      <p className="text-gray-600">
                        Planes personalizados de mantenimiento preventivo para
                        mantener tus equipos siempre operativos.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Soporte Prioritario
                      </h4>
                      <p className="text-gray-600">
                        Atención preferencial con tiempos de respuesta
                        garantizados y soporte técnico dedicado.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Facturación Corporativa
                      </h4>
                      <p className="text-gray-600">
                        Facturación electrónica, crédito empresarial y
                        descuentos por volumen disponibles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <Image
                  src="/images/servicios/asesoria.png"
                  alt="Servicio técnico de proyectores para organizaciones y empresas en Lima - Mantenimiento preventivo y soporte técnico"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Sectores que Atendemos
              </h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Corporativo
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Oficinas, salas de juntas y espacios corporativos
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Educativo
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Colegios, universidades y centros de capacitación
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Gobierno</h4>
                  <p className="text-gray-600 text-sm">
                    Instituciones públicas y entidades gubernamentales
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Eventos</h4>
                  <p className="text-gray-600 text-sm">
                    Empresas de eventos, hoteles y centros de convenciones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Servicio Técnico de Proyectores para Organizaciones y Empresas
                en Lima (B2B)
              </h2>
              <p className="text-xl text-gray-600">
                Mantenimiento preventivo y soporte técnico integral para
                empresas privadas, colegios, institutos, universidades, iglesias
                y centros educativos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-[#102239]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-[#102239]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Garantía Real
                </h3>
                <p className="text-gray-600">
                  6 meses de garantía en todas nuestras reparaciones.
                  Respaldamos nuestro trabajo con compromiso.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-[#E94E1B]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-[#E94E1B]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Atención Rápida
                </h3>
                <p className="text-gray-600">
                  Respondemos en 24 horas. Sabemos que tu tiempo es valioso y
                  tus equipos son importantes.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center transform transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 bg-[#102239]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-8 h-8 text-[#102239]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Técnicos Expertos
                </h3>
                <p className="text-gray-600">
                  Especialistas certificados en todas las marcas: Epson, BenQ,
                  Optoma, Sony, Panasonic y más.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#102239] via-[#1a3654] to-[#E94E1B] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Listo para Comenzar?
            </h2>
            <p className="text-xl mb-8 text-white/80">
              Selecciona el tipo de servicio que necesitas y obtén un
              presupuesto gratuito
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/servicios/tecnico/persona">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-[#102239] hover:bg-gray-100 flex items-center justify-center gap-2"
                  styleVariant="solid"
                >
                  <div className="flex gap-2 flex-wrap">
                    <User className="w-5 h-5" />
                    <span>Persona Natural</span>
                  </div>
                </Button>
              </Link>
              <Link href="/servicios/tecnico/organizacion">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#E94E1B] text-white hover:bg-[#d4441a] flex items-center justify-center gap-2"
                  styleVariant="solid"
                >
                  <div className="flex gap-2 flex-wrap">
                    <Building2 className="w-5 h-5" />
                    <span>Organización</span>
                  </div>
                </Button>
              </Link>
            </div>

            <div className="mt-12 pt-12 border-t border-white/20">
              <h3 className="text-2xl font-bold mb-6">Contáctanos</h3>
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <a
                  href="tel:+51972300301"
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  +51 972 300 301
                </a>
                <a
                  href="mailto:info@iubizon.com"
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  info@iubizon.com
                </a>
                <div className="flex items-center text-white/80">
                  <MapPin className="w-5 h-5 mr-2" />
                  Lima, Perú
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
