import type { Metadata } from "next";
import Image from "next/image";
import { Handshake, Headphones, MonitorSmartphone, Shield } from "lucide-react";
import Brands from "@/components/ui/Brands";
import CTASection from "@/components/ui/CTASection";
import StatsGrid from "@/components/ui/StatsGrid";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "Quiénes Somos - Expertos en Proyectores y Tecnología Educativa | iubizon",
    description:
      "Conoce la historia de iubizon, empresa especialista en proyectores y tecnología educativa en Lima. Equipo con 5 años de experiencia brindando soluciones innovadoras desde 2020.",
    keywords: [
      "quienes somos iubizon",
      "empresa proyectores Lima",
      "historia iubizon",
      "tecnología educativa Perú",
      "empresa proyectores Perú",
      "especialistas Epson Lima",
      "distribuidores proyectores",
      "servicio técnico proyectores",
      "empresa tecnología educativa",
      "proyectores empresariales Lima",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/quienes-somos",
    },
    openGraph: {
      type: "website",
      title:
        "Quiénes Somos - Expertos en Proyectores y Tecnología Educativa | iubizon",
      url: "https://www.iubizon.com/quienes-somos",
      description:
        "Conoce la historia de iubizon, empresa especialista en proyectores y tecnología educativa en Lima. Equipo con 5 años de experiencia desde 2020.",
      images: [
        {
          url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
          width: 1200,
          height: 630,
          alt: "Equipo iubizon - Expertos en proyectores y tecnología educativa",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Quiénes Somos - Expertos en Proyectores | iubizon",
      description:
        "Conoce la historia de iubizon, empresa especialista en proyectores y tecnología educativa en Lima desde 2020.",
      images: [
        {
          url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
          alt: "Equipo iubizon - Expertos en proyectores y tecnología educativa",
        },
      ],
      site: "@iubizon",
    },
    authors: [{ name: "iubi", url: "https://www.iubi.pe" }],
    publisher: "iubizon",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    category: "Empresa",
    applicationName: "iubizon",
    generator: "Next.js",
    metadataBase: new URL("https://www.iubizon.com"),
  };
}

// Structured Data for Organization
function generateStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "iubizon",
    description:
      "Empresa líder en proyectores y tecnología educativa en Lima, Perú. Especialistas en soluciones Epson para empresas y centros educativos.",
    url: "https://www.iubizon.com/quienes-somos",
    logo: "https://www.iubizon.com/images/logo.png",
    foundingDate: "2020",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Pje. los Jazmines 181",
      addressLocality: "Chorrillos",
      addressRegion: "Lima",
      postalCode: "15067",
      addressCountry: "PE",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+51-972-300-301",
      contactType: "customer service",
      areaServed: "PE",
      availableLanguage: "Spanish",
    },
    sameAs: [
      "https://www.facebook.com/iubizon",
      "https://www.instagram.com/iubizon",
      "https://www.tiktok.com/@iubizon",
    ],
    areaServed: {
      "@type": "Country",
      name: "Peru",
    },
    knowsAbout: [
      "Proyectores",
      "Tecnología Educativa",
      "Equipos Audiovisuales",
      "Servicio Técnico",
      "Epson",
    ],
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
        name: "Quiénes Somos",
        item: "https://www.iubizon.com/quienes-somos",
      },
    ],
  };

  return { organizationData, breadcrumbData };
}

export default function AboutUsPage() {
  const { organizationData, breadcrumbData } = generateStructuredData();

  // Estadísticas de la empresa
  const stats = [
    {
      number: "5+",
      label: "Años de Experiencia",
      icon: "📅",
      description: "En el mercado peruano",
    },
    {
      number: "20+",
      label: "Proyectos Realizados",
      icon: "🎯",
      description: "Para empresas e instituciones",
    },
    {
      number: "12",
      label: "Meses de Garantía",
      icon: "🛡️",
      description: "En equipos nuevos",
    },
    {
      number: "100%",
      label: "Productos Originales",
      icon: "✓",
      description: "Distribuidores autorizados",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <main className="min-h-screen bg-[#060e1e] font-sfpro">
        {/* Hero Section - Estilo Landing */}
        <header className="relative py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-[#0a1628] to-primary"></div>

          {/* Decorative circles */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-sm font-semibold text-white uppercase tracking-wide">
                  Sobre Nosotros
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                ¿Quiénes <span className="text-primary">Somos</span>?
              </h1>

              <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 leading-relaxed">
                Especialistas brindando soluciones tecnológicas en experiencias
                y aprendizaje dinámico que conecta, inspira y potencia
                resultados.
              </p>

              {/* Decorative line */}
              <div className="flex justify-center">
                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Nuestra Historia - Estilo moderno */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060e1e] via-[#0a1628] to-[#060e1e]"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Imagen */}
              <div className="relative order-2 lg:order-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-3xl blur-2xl"></div>
                <div className="relative bg-gradient-to-br from-white/5 to-white/10 p-2 rounded-3xl border border-white/10">
                  <Image
                    src="/images/iubiz-with-land.png"
                    alt="Historia de Iubizon"
                    width={600}
                    height={400}
                    className="w-full h-auto rounded-2xl"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Contenido */}
              <div
                className="order-1 lg:order-2"
                itemScope
                itemType="https://schema.org/AboutPage"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Nuestra Historia
                  </span>
                </div>

                <h2
                  className="text-4xl md:text-5xl font-bold text-white mb-6"
                  itemProp="name"
                >
                  Innovación y experiencia en cada proyecto
                </h2>

                <div
                  className="space-y-6 text-lg text-gray-300 leading-relaxed"
                  itemProp="description"
                >
                  <p>
                    Desde{" "}
                    <strong className="text-primary font-bold">2020</strong>,
                    hemos revolucionado la forma en que las organizaciones
                    implementan tecnología de proyección. Con más de{" "}
                    <strong className="text-white font-semibold">
                      5 años de experiencia
                    </strong>{" "}
                    en el mercado peruano, nos especializamos en soluciones
                    integrales que combinan hardware de última generación con
                    soporte técnico especializado.
                  </p>
                  <p>
                    Como{" "}
                    <strong className="text-white font-semibold">
                      distribuidores de Epson
                    </strong>{" "}
                    y partners de las marcas más reconocidas del sector,
                    garantizamos productos originales respaldados por{" "}
                    <strong className="text-white font-semibold">
                      garantía extendida
                    </strong>{" "}
                    y servicio técnico profesional.
                  </p>

                  {/* Features list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-gray-300">
                        Asesoría especializada
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-gray-300">
                        Instalación profesional
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-gray-300">Soporte continuo</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                      </div>
                      <span className="text-gray-300">Garantía extendida</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Estadísticas */}
        <section className="relative py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] to-[#060e1e]"></div>
          <div className="relative z-10">
            <StatsGrid stats={stats} className="" />
          </div>
        </section>

        {/* Marcas */}
        <section className="relative py-16">
          <div className="absolute inset-0 bg-[#060e1e]"></div>
          <div className="relative z-10">
            <Brands className="" />
          </div>
        </section>

        {/* Por Qué Elegirnos */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#060e1e] via-[#0a1628] to-[#060e1e]"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  Nuestro Valor
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                ¿Por Qué Elegirnos?
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Más que proveedores, somos tu socio estratégico en tecnología
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Garantía y Confianza
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Productos 100% originales con garantía extendida y soporte
                    técnico especializado.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <MonitorSmartphone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Tecnología de Punta
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Soluciones audiovisuales de última generación adaptadas a
                    tus necesidades.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Headphones className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Soporte Especializado
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Equipo técnico certificado disponible para asesoría
                    personalizada.
                  </p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all duration-300 backdrop-blur-sm h-full">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Handshake className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Compromiso Total
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Acompañamiento completo desde la cotización hasta el
                    postventa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <CTASection
          title="¿Listo para Transformar tu Espacio?"
          description="Descubre cómo nuestros especialistas pueden ayudarte a encontrar la solución perfecta en proyectores y tecnología audiovisual para tu negocio o institución."
          primaryButton={{
            text: "Contáctanos Hoy",
            href: "/contacto",
          }}
          secondaryButton={{
            text: "Nuestros Servicios",
            href: "/servicios/tecnico",
          }}
        />
      </main>
    </>
  );
}
