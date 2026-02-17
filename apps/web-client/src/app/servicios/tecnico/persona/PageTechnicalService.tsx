"use client";

import { Metadata } from "next";
import { StepsGroup } from "@/app/servicios/tecnico/persona/StepsGroup";
import FAQAccordion from "@/components/ui/layout/FAQAccordion";
import { CheckCircle, ShieldCheck, Clock, CircleCheck } from "lucide-react";
import GridCards, { GridCardItem } from "@/components/ui/GridCards";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import CardSteps from "@/components/ui/CardSteps";
import { Button } from "@/components/ui/Button";
import WorksGallery from "@/components/ui/WorksGallery";

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
    {
      "@type": "ListItem",
      position: 4,
      name: "Persona Natural",
      item: "https://www.iubizon.com/servicios/tecnico/persona",
    },
  ],
};

const benefits: GridCardItem[] = [
  {
    title: "Garantía",
    description:
      "6 meses de garantía en todas nuestras reparaciones. Tu inversión protegida.",
    frontImage: "/images/servicios/platersfood.jpg",
    alt: "Garantía de Servicio",
    icon: ShieldCheck,
    iconColor: "text-blue-600",
    subtitle: "Protección garantizada en cada reparación realizada",
    delay: 0,
  },
  {
    title: "Atención Rápida",
    description: "Respondemos en 24 horas con servicio a domicilio en Lima.",
    frontImage: "/images/servicios/asesoria.png",
    alt: "Atención Rápida",
    icon: Clock,
    iconColor: "text-orange-600",
    subtitle: "Nos aseguramos que recibas atención lo antes posible",
    delay: 0.1,
  },
  {
    title: "Técnicos Expertos",
    description:
      "Especialistas certificados con años de experiencia garantizada.",
    frontImage: "/images/servicios/tecnicos.png",
    alt: "Técnicos Especializados",
    icon: CircleCheck,
    iconColor: "text-green-600",
    subtitle: "Nuestros técnicos se encargarán de brindarte un buen resultado",
    delay: 0.2,
  },
];

export const metadata: Metadata = {
  title:
    "Servicio Técnico de Proyectores | Mantenimiento y Reparación Especializada | iubizon",
  description:
    "Servicio técnico profesional de proyectores en Lima. Mantenimiento preventivo, reparaciones especializadas y soporte técnico con garantía. Técnicos expertos en todas las marcas.",
  keywords: [
    "servicio técnico proyectores",
    "reparación proyectores Lima",
    "mantenimiento proyectores",
    "servicio técnico Epson",
    "reparación proyectores empresas",
    "mantenimiento preventivo proyectores",
    "técnico proyectores domicilio",
    "servicio proyectores educación",
    "reparación lámparas proyector",
    "calibración proyectores",
    "limpieza filtros proyector",
    "proyectores corporativos",
  ],
  authors: [{ name: "iubizon" }],
  creator: "iubizon",
  publisher: "iubizon",
  metadataBase: new URL("https://www.iubizon.com/servicios/tecnico"),
  alternates: {
    canonical: "https://www.iubizon.com/servicios/tecnico",
  },
  openGraph: {
    title:
      "Servicio Técnico de Proyectores | Mantenimiento y Reparación Especializada",
    description:
      "Servicio técnico profesional de proyectores en Lima. Mantenimiento preventivo, reparaciones especializadas y soporte técnico con garantía.",
    url: "https://www.iubizon.com/servicios/tecnico",
    siteName: "iubizon",
    images: [
      {
        url: "/images/proyectores-reparaciones.webp",
        width: 1200,
        height: 630,
        alt: "Servicio técnico especializado de proyectores",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicio Técnico de Proyectores | Mantenimiento y Reparación",
    description:
      "Servicio técnico profesional de proyectores en Lima. Mantenimiento preventivo y reparaciones especializadas con garantía.",
    images: ["/images/proyectores-reparaciones.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function PageTechnicalService() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "iubizon",
              image: "https://www.iubizon.com/images/logo.png",
              "@id": "https://www.iubizon.com/servicios/tecnico",
              url: "https://www.iubizon.com/servicios/tecnico",
              telephone: "+51 972 300 301",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Pje. los Jazmines 181",
                addressLocality: "Chorrillos",
                addressRegion: "Lima",
                addressCountry: "PE",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: -12.186,
                longitude: -77.014,
              },
              openingHours: "Mo-Fr 09:00-18:00, Sa 09:00-13:00",
              sameAs: [
                "https://www.facebook.com/iubizon/",
                "https://www.instagram.com/iubizon",
                "https://www.tiktok.com/@iubizon",
              ],
              description:
                "Servicio técnico de mantenimiento y reparación de proyectores Epson, BenQ, Sony y más en Lima. Diagnóstico, repuestos originales y atención a domicilio.",
            }),
          }}
        />
      </Head>
      <main>
        <header
          className="relative h-[39rem] bg-gradient-to-br from-secondary/10 via-secondary to-secondary/0 overflow-hidden"
          role="banner"
        >
          <div className="absolute inset-0">
            <Image
              src="/images/Servicio tecnico para retail.png"
              alt="Servicio técnico de proyectores Epson, BenQ, Sony en Lima"
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        </header>
        <section
          className="relative -mt-[39rem] sm:-mt-[40rem] z-20 px-4"
          id="contact-form"
          aria-label="Formulario de contacto para reparación de proyectores"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative z-10 h-auto px-[2em] pt-[3em] 2xl:pt-[5em] flex flex-col justify-center items-center text-center">
              <div className="max-w-4xl mx-auto mb-8">
                <div className="w-full flex justify-center">
                  <span className="inline-block bg-primary/13 text-primary font-semibold px-4 py-1 rounded-full mb-4">
                    Solicita o Cotiza
                  </span>
                </div>
                <h1 className="text-3xl md:text-[2.5em] font-bold text-white mb-4 leading-tight">
                  Servicio Técnico de Proyectores
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
                  Soluciones profesionales en mantenimiento, diagnóstico y
                  reparación de proyectores en Lima. Garantía, repuestos
                  originales y atención a domicilio para todas las marcas.
                </p>
              </div>
            </div>
            <StepsGroup />
          </div>
        </section>
        <WorksGallery type="individual" />
        <section
          className="mt-10 pt-0 pb-16 bg-white"
          itemScope
          itemType="https://schema.org/HowTo"
          aria-label="Cómo funciona el servicio de reparación de proyectores"
        >
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                itemProp="name"
              >
                ¿Cómo Funciona Nuestro Servicio de Reparación de Proyectores?
              </h2>
              <p
                className="text-xl text-gray-600 max-w-3xl mx-auto"
                itemProp="description"
              >
                Recibimos tu proyector Epson, BenQ, Sony u otra marca en Lima,
                realizamos diagnóstico profesional y usamos repuestos originales
                para que funcione como nuevo. Atención rápida y resultados
                garantizados.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 max-w-7xl mx-auto items-center">
              {/* Columna izquierda - Imagen */}
              <div
                className="md:col-span-1 opacity-0 animate-fade-in-up"
                style={{ animationFillMode: "forwards" }}
              >
                <div className="relative h-auto rounded-3xl overflow-hidden shadow-xl">
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: "3/4", minHeight: "600px" }}
                  >
                    <Image
                      src="/images/contactClient.png"
                      alt="Servicio técnico de proyectores profesional"
                      fill
                      className="object-cover rounded-3xl"
                    />
                  </div>
                </div>
              </div>
              <CardSteps />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <article
                className="bg-blue-50 p-6 rounded-xl"
                itemScope
                itemType="https://schema.org/Service"
                aria-label="Mantenimiento preventivo de proyectores"
              >
                <h4
                  className="text-lg font-bold text-blue-900 mb-4 flex items-center"
                  itemProp="name"
                >
                  <CheckCircle className="w-6 h-6 mr-2" aria-label="Check" />
                  Mantenimiento Preventivo de Proyectores
                </h4>
                <p className="text-blue-800" itemProp="description">
                  Revisiones periódicas para prolongar la vida útil de tu
                  proyector Epson, BenQ, Sony y más. Limpieza de filtros,
                  calibración de imagen, verificación de componentes y
                  optimización del rendimiento.
                </p>
                <meta itemProp="serviceType" content="Mantenimiento" />
                <meta itemProp="areaServed" content="Lima, Perú" />
              </article>
              <article
                className="bg-orange-50 p-6 rounded-xl"
                itemScope
                itemType="https://schema.org/Service"
                aria-label="Reparación especializada de proyectores"
              >
                <h4
                  className="text-lg font-bold text-orange-900 mb-4 flex items-center"
                  itemProp="name"
                >
                  <CheckCircle className="w-6 h-6 mr-2" aria-label="Check" />
                  Reparación Especializada de Proyectores
                </h4>
                <p className="text-orange-800" itemProp="description">
                  Solucionamos problemas de imagen, sonido, conectividad,
                  reemplazo de lámparas, reparación de ventiladores y cualquier
                  falla técnica con repuestos originales y garantía de 6 meses.
                </p>
                <meta itemProp="serviceType" content="Reparación" />
                <meta itemProp="areaServed" content="Lima, Perú" />
              </article>
            </div>
          </div>
        </section>
        <section
          className="py-20 bg-gradient-to-b from-white via-gray-50 to-white"
          aria-labelledby="benefits-heading"
          aria-label="Beneficios del servicio de reparación de proyectores"
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-20">
              <h2
                id="benefits-heading"
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 opacity-0 animate-fade-in-up"
                style={{ animationFillMode: "forwards" }}
              >
                ¿Por Qué Elegir Nuestro Servicio Técnico?
              </h2>
              <p
                className="text-xl text-gray-600 max-w-2xl mx-auto font-medium opacity-0 animate-fade-in-up"
                style={{
                  animationDelay: "0.1s",
                  animationFillMode: "forwards",
                }}
              >
                Descubre los beneficios de trabajar con expertos certificados en
                reparación de proyectores
              </p>
            </div>

            {/* Grid con 3 tarjetas */}
            <GridCards items={benefits} columns={3} maxWidth="6xl" />
          </div>
        </section>

        <FAQAccordion />

        <section
          className="py-16 relative bg-gradient-to-br from-secondary/10 via-secondary to-secondary/0 overflow-hidden"
          aria-label="Solicita reparación de proyector"
        >
          <div className="absolute inset-0">
            <Image
              src="/images/proyectores-reparaciones.webp"
              alt="Servicio técnico de proyectores Epson, BenQ, Sony en Lima"
              fill
              className="object-cover opacity-50"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-white/30 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Tu Proyector Necesita Reparación?
              </h2>
              <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto">
                No arriesgues tu equipo con aficionados. Hacemos que tu
                proyector vuelva a brillar como el primer día.
              </p>
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-white/95">
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="w-5 h-5 text-primary"
                    aria-label="Check"
                  />
                  <span className="text-sm font-medium">Respuesta en 24h</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="w-5 h-5 text-primary"
                    aria-label="Check"
                  />
                  <span className="text-sm font-medium">6 meses garantía</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle
                    className="w-5 h-5 text-primary"
                    aria-label="Check"
                  />
                  <span className="text-sm font-medium">Técnicos expertos</span>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    document.getElementById("contact-form")?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  variant="primary"
                  size="lg"
                  className="text-lg"
                  aria-label="Solicitar reparación de proyector"
                >
                  Solicitar Reparación Ahora
                </Button>
                <p className="text-sm text-white/80">
                  ⚡ Proceso rápido • 📧 Confirmación por email
                </p>
                <Link
                  href="/contacto"
                  className="underline text-white/90 hover:text-primary"
                >
                  ¿Tienes dudas? Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
