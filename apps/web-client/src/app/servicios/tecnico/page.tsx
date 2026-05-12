import type { Metadata } from "next";
import TechnicalServicePage from "./TechnicalServicePage";

export const metadata: Metadata = {
  title:
    "Servicio Técnico de Proyectores para Personas y Organizaciones | Mantenimiento y Reparación en Lima, Perú | iubizon",
  description:
    "Servicio técnico especializado de proyectores para personas y organizaciones en Lima y todo Perú. Atendemos a empresas privadas, colegios, institutos, universidades, iglesias y centros educativos. Ofrecemos mantenimiento preventivo, reparación de proyectores Epson, Sony, BenQ, diagnóstico gratuito y soporte técnico profesional con garantía. Atención a domicilio para personas, empresas e instituciones.",
  keywords: [
    "servicio técnico proyectores personas",
    "servicio técnico proyectores organizaciones",
    "servicio técnico proyectores empresas",
    "servicio técnico proyectores empresas privadas",
    "servicio técnico proyectores colegios",
    "servicio técnico proyectores institutos",
    "servicio técnico proyectores universidades",
    "servicio técnico proyectores iglesias",
    "servicio técnico proyectores auditorios",
    "servicio técnico proyectores centros educativos",
    "servicio técnico proyectores corporativos",
    "reparación proyectores Lima",
    "reparación proyectores colegios Lima",
    "reparación proyectores empresas Lima",
    "mantenimiento proyectores personas",
    "mantenimiento proyectores empresas",
    "mantenimiento proyectores colegios",
    "mantenimiento proyectores institutos",
    "mantenimiento proyectores universidades",
    "mantenimiento proyectores corporativo",
    "mantenimiento proyectores educación",
    "servicio técnico Epson Lima",
    "servicio técnico proyectores a domicilio",
    "reparación proyectores corporativos",
    "mantenimiento preventivo proyectores empresas",
    "mantenimiento preventivo proyectores",
    "técnico proyectores domicilio Lima",
    "servicio proyectores educación",
    "servicio proyectores instituciones educativas",
    "reparación lámparas proyector",
    "calibración proyectores profesional",
    "limpieza filtros proyector",
    "diagnóstico gratuito proyectores",
    "soporte técnico proyectores Perú",
    "soporte técnico proyectores empresas",
    "mantenimiento proyectores salas de reunión",
    "mantenimiento proyectores aulas",
    "servicio técnico proyectores organizaciones sin fines de lucro",
    "mantenimiento proyectores centros religiosos",
    "servicio técnico proyectores oficinas",
  ],
  authors: [{ name: "iubizon" }],
  creator: "iubizon",
  publisher: "iubizon",
  metadataBase: new URL("https://www.iubizon.com"),
  alternates: {
    canonical: "https://www.iubizon.com/servicios/tecnico",
  },
  openGraph: {
    title:
      "Servicio Técnico de Proyectores para Personas y Organizaciones | Mantenimiento y Reparación Lima",
    description:
      "Servicio técnico especializado de proyectores para personas y organizaciones en Lima y todo Perú. Atendemos empresas privadas, colegios, institutos, universidades, iglesias y centros educativos. Mantenimiento preventivo, reparación de proyectores Epson, Sony, BenQ con garantía.",
    url: "https://www.iubizon.com/servicios/tecnico",
    siteName: "iubizon - Productos Tecnológicos",
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
    title:
      "Servicio Técnico de Proyectores para Personas y Organizaciones | Lima, Perú",
    description:
      "Servicio técnico especializado de proyectores para personas y organizaciones en Lima y todo Perú. Mantenimiento preventivo, reparación de proyectores Epson, Sony, BenQ con garantía.",
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

export default function Page() {
  return <TechnicalServicePage />;
}
