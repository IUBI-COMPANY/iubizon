import type { Metadata } from "next";
import ContactClientPage from "./ContactClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contacto - Cotiza Bundle Interactivo y Dúo Interactivo | iubizon",
    description:
      "Contáctanos para cotizar el Bundle Interactivo y Dúo Interactivo. Soluciones educativas innovadoras para colegios y empresas en Lima y todo Perú. Atención personalizada y respuesta rápida.",
    keywords: [
      "contacto iubizon",
      "cotizar bundle interactivo",
      "cotizar dúo interactivo",
      "consultas tecnología educativa",
      "atención al cliente",
      "soporte técnico",
      "Lima",
      "Perú",
      "asesoría soluciones educativas",
      "cotizar aulas interactivas",
      "iubizon",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/contacto",
    },
    openGraph: {
      type: "website",
      title: "Contacto - Cotiza Bundle Interactivo y Dúo Interactivo | iubizon",
      url: "https://www.iubizon.com/contacto",
      description:
        "Contáctanos para cotizar el Bundle Interactivo y Dúo Interactivo. Soluciones educativas innovadoras para colegios y empresas en Lima y todo Perú.",
      images: [
        {
          url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
          width: 1200,
          height: 630,
          alt: "Formulario de contacto iubizon - Lima, Perú",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Contacto - Cotiza Bundle Interactivo y Dúo Interactivo | iubizon",
      description:
        "Contáctanos para cotizar el Bundle Interactivo y Dúo Interactivo. Soluciones educativas innovadoras en Lima y todo Perú.",
      images: [
        {
          url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
          alt: "Formulario de contacto iubizon - Lima, Perú",
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
    category: "Contacto",
    applicationName: "iubizon",
    generator: "Next.js",
    metadataBase: new URL("https://www.iubizon.com"),
  };
}

export default async function Page() {
  return <ContactClientPage />;
}
