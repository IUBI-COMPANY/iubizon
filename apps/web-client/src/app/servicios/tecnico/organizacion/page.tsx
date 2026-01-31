import type { Metadata } from "next";
import PageOrganizationsTechnicalService from "./Page-OrganizationsTechnicalService";

// ==========================
// 🔹 Dynamic Metada
// ==========================
export async function generateMetadata(): Promise<Metadata> {
  return {
    title:
      "Servicio técnico de Proyectores para instituciones y empresas en Lima, Perú | iubizon",
    description:
      "Servicio técnico de mantenimiento y reparación de proyectores en Lima y todo Perú a instituciones y/o empresas. Soluciones rápidas, repuestos originales y atención personalizada. Cotiza gratis. Trabajamos con escuelas, universidades, oficinas y más.",
    keywords: [
      "mantenimiento de proyectores para empresas",
      "mantenimiento de proyectores para colegios",
      "reparación de proyectores para escuelas",
      "reparación de proyectores para universidades",
      "reparación de proyectores para oficinas",
      "servicio técnico de proyectores",
      "arreglo de proyectores en Lima",
      "arreglo y mantenimiento preventivo de proyectores Perú",
      "iubizon",
      "proyectores Epson",
      "proyectores BenQ",
      "proyectores Optoma",
      "soporte de proyectores",
      "repuestos de proyectores",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/servicios/tecnico/organizacion",
    },
    openGraph: {
      type: "website",
      title:
        "Servicio técnico de Proyectores para instituciones y empresas en Lima, Perú | iubizon",
      url: "https://www.iubizon.com/servicios/tecnico/organizacion",
      description:
        "Servicio técnico de mantenimiento y reparación de proyectores en Lima y todo Perú a instituciones y/o empresas. Soluciones rápidas, repuestos originales y atención personalizada. Cotiza gratis. Trabajamos con escuelas, universidades, oficinas y más.",
      images: [
        {
          url: "https://www.iubizon.com/soporte-tecnico-y-mantenimiento.jpg",
          width: 1200,
          height: 630,
          alt: "Servicio de reparación de proyectores en Lima y Perú",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title:
        "Servicio técnico de Proyectores para instituciones y empresas en Lima, Perú | iubizon",
      description:
        "Servicio técnico de mantenimiento y reparación de proyectores en Lima y todo Perú a instituciones y/o empresas. Soluciones rápidas, repuestos originales y atención personalizada. Cotiza gratis. Trabajamos con escuelas, universidades, oficinas y más.",
      images: [
        {
          url: "https://www.iubizon.com/soporte-tecnico-y-mantenimiento.jpg",
          alt: "Servicio de reparación de proyectores en Lima y Perú",
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
    category: "Servicios",
    applicationName: "iubizon",
    generator: "Next.js",
    metadataBase: new URL("https://www.iubizon.com"),
  };
}

// ==========================
// 🔹 Página principal (Server)
// ==========================
export default async function Page() {
  return <PageOrganizationsTechnicalService />;
}
