import type { Metadata } from "next";
import { products } from "@/data-list/products";
import DemoPageClient from "./DemoPageClient";

const DEMO_PRODUCT_IDS = ["bundle-interactivo", "duo-interactivo"];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Solicita una Demo - Productos Tecnológicos | iubizon",
    description:
      "Agenda una demostración gratuita de nuestros productos tecnológicos. Proyectores, accesorios y equipos. Te asesoramos en todo el proceso.",
    keywords: [
      "demo productos tecnológicos",
      "demostración proyectores",
      "probar equipos",
      "demo tecnología perú",
      "iubizon",
      "Perú",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/demo",
    },
    openGraph: {
      type: "website",
      title: "Solicita una Demo - Productos Tecnológicos | iubizon",
      url: "https://www.iubizon.com/demo",
      description:
        "Agenda una demostración gratuita de productos tecnológicos en Perú.",
      images: [
        {
          url: "https://www.iubizon.com/venta-de-proyectores.jpg",
          width: 1200,
          height: 630,
          alt: "Solicita una demo en iubizon",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Solicita una Demo - Productos Tecnológicos | iubizon",
      description:
        "Agenda una demostración gratuita de productos tecnológicos en Perú.",
      images: [
        {
          url: "https://www.iubizon.com/venta-de-proyectores.jpg",
          alt: "Solicita una demo en iubizon",
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
    category: "Demo",
    applicationName: "iubizon",
    generator: "Next.js",
    metadataBase: new URL("https://www.iubizon.com"),
  };
}

export default function DemoPage() {
  const demoProducts = DEMO_PRODUCT_IDS.map((id) =>
    products.find((product) => product.id === id),
  ).filter(Boolean);

  return <DemoPageClient demoProducts={demoProducts} />;
}
