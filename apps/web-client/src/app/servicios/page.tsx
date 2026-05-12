import type { Metadata } from "next";
import ServicesMarketplace from "./ServicesMarketplace";

export const metadata: Metadata = {
  title: "Servicios Tecnológicos | iubizon",
  description:
    "Encuentra servicios tecnológicos ofrecidos por usuarios. Reparación, instalación, configuración y más. Contrata servicios especializados en Perú.",
  keywords: [
    "servicios tecnológicos",
    "servicios tech",
    "reparación equipos",
    "instalación proyectores",
    "servicios de técnicos",
    "contratar servicios",
    "marketplace servicios",
    "servicios perú",
    "iubizon",
  ],
  alternates: {
    canonical: "https://www.iubizon.com/servicios",
  },
  openGraph: {
    title: "Servicios Tecnológicos | iubizon",
    description:
      "Encuentra servicios tecnológicos ofrecidos por usuarios en Perú.",
    url: "https://www.iubizon.com/servicios",
    type: "website",
    siteName: "iubizon",
    locale: "es_PE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios Tecnológicos | iubizon",
    description:
      "Encuentra servicios tecnológicos ofrecidos por usuarios en Perú.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesPage() {
  return <ServicesMarketplace />;
}