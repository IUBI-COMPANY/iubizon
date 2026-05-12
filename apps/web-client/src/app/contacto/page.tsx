import type { Metadata } from "next";
import ContactClientPage from "./ContactClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Contacto - iubizon | Compra y Venta de Tecnología",
    description:
      "Contáctanos para comprar o vender productos tecnológicos. Proyectores, accesorios, equipos y más en Perú. Atención personalizada y respuesta rápida.",
    keywords: [
      "contacto iubizon",
      "comprar tecnología",
      "vender tecnología",
      "consultas productos tecnológicos",
      "atención al cliente",
      "soporte técnico",
      "Lima",
      "Perú",
      "asesoría tecnológica",
      "cotizar equipos",
      "iubizon",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/contacto",
    },
    openGraph: {
      type: "website",
      title: "Contacto - iubizon | Compra y Venta de Tecnología",
      url: "https://www.iubizon.com/contacto",
      description:
        "Contáctanos para comprar o vender productos tecnológicos en Perú.",
      images: [
        {
          url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
          width: 1200,
          height: 630,
          alt: "Formulario de contacto iubizon - Perú",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Contacto - iubizon | Compra y Venta de Tecnología",
      description:
        "Contáctanos para comprar o vender productos tecnológicos en Perú.",
      images: [
        {
          url: "https://www.iubizon.com/tu-mundo-multimedia.jpg",
          alt: "Formulario de contacto iubizon - Perú",
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
