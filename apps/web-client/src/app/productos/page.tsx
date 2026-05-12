import type { Metadata } from "next";
import ProductsClientPage from "./ProductsClientPage";

// ==========================
// 🔹 Dynamic Metada
// ==========================
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Catálogo de Productos Tecnológicos | iubizon",
    description:
      "Explora nuestro catálogo de productos tecnológicos: proyectores, accesorios, equipos y más. Compra online, cotiza gratis y recibe asesoría personalizada en Perú.",
    keywords: [
      "catálogo productos tecnológicos",
      "proyectores",
      "accesorios tecnológicos",
      "equipos tecnológicos",
      "tecnología en venta",
      "compra tecnología perú",
      "iubizon",
      "Perú",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/productos",
    },
    openGraph: {
      type: "website",
      title: "Catálogo de Productos Tecnológicos | iubizon",
      url: "https://www.iubizon.com/productos",
      description:
        "Explora nuestro catálogo de productos tecnológicos en Perú. Proyectores, accesorios, equipos y más.",
      images: [
        {
          url: "https://www.iubizon.com/venta-de-proyectores.jpg",
          width: 1200,
          height: 630,
          alt: "Catálogo de productos tecnológicos en Perú",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Catálogo de Productos Tecnológicos | iubizon",
      description:
        "Explora nuestro catálogo de productos tecnológicos en Perú.",
      images: [
        {
          url: "https://www.iubizon.com/venta-de-proyectores.jpg",
          alt: "Catálogo de productos tecnológicos en Perú",
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
    category: "Productos",
    applicationName: "iubizon",
    generator: "Next.js",
    metadataBase: new URL("https://www.iubizon.com"),
  };
}

// ==========================
// 🔹 Página principal (Server)
// ==========================
export default async function Page() {
  return <ProductsClientPage />;
}
