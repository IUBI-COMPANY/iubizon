import type { Metadata } from "next";
import ProductsClientPage from "./ProductsClientPage";

// ==========================
// 🔹 Dynamic Metada
// ==========================
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Catálogo de Proyectores y Accesorios | iubizon",
    description:
      "Explora nuestro catálogo de proyectores Epson, accesorios para Bundle Interactivo y componentes individuales. Compra online, cotiza gratis y recibe asesoría personalizada en Lima y Perú.",
    keywords: [
      "catálogo proyectores epson",
      "accesorios bundle interactivo",
      "touch interactivo",
      "miracast",
      "proyectores en venta",
      "repuestos proyectores",
      "comprar proyectores Lima",
      "proyectores Epson",
      "accesorios originales",
      "iubizon",
      "Perú",
    ],
    alternates: {
      canonical: "https://www.iubizon.com/productos",
    },
    openGraph: {
      type: "website",
      title: "Catálogo de Proyectores y Accesorios | iubizon",
      url: "https://www.iubizon.com/productos",
      description:
        "Explora nuestro catálogo de proyectores Epson y accesorios para Bundle Interactivo en Lima y Perú. Compra online, cotiza gratis y recibe asesoría personalizada.",
      images: [
        {
          url: "https://www.iubizon.com/venta-de-proyectores.jpg",
          width: 1200,
          height: 630,
          alt: "Catálogo de proyectores y accesorios en Lima y Perú",
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title: "Catálogo de Proyectores y Accesorios | iubizon",
      description:
        "Explora nuestro catálogo de proyectores Epson y accesorios para Bundle Interactivo en Lima y Perú.",
      images: [
        {
          url: "https://www.iubizon.com/venta-de-proyectores.jpg",
          alt: "Catálogo de proyectores y accesorios en Lima y Perú",
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
