import type { Metadata } from "next";
import { products, Product } from "@/data-list/products";
import { NoFoundComponent } from "@/components/ui/NoFoundComponent";
import DemoProductClientPage from "./DemoProductClientPage";

interface Props {
  params: Promise<{ productId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product: Product | undefined = products.find(
    (item) => item.id === productId,
  );

  if (!product) {
    return {
      title: "Demo no encontrada | iubizon",
      description: "Este producto no existe en nuestro cat\u00e1logo.",
      keywords: ["demo", "producto no encontrado", "iubizon"],
      alternates: {
        canonical: `https://www.iubizon.com/demo/${productId}`,
      },
      openGraph: {
        type: "website",
        title: "Demo no encontrada | iubizon",
        url: `https://www.iubizon.com/demo/${productId}`,
        description: "Este producto no existe en nuestro cat\u00e1logo.",
        images: [
          {
            url: "/images/product-not-found.png",
            width: 1200,
            height: 630,
            alt: "Producto no encontrado en iubizon",
          },
        ],
        siteName: "iubizon",
        locale: "es_PE",
      },
      twitter: {
        card: "summary_large_image",
        title: "Demo no encontrada | iubizon",
        description: "Este producto no existe en nuestro cat\u00e1logo.",
        images: [
          {
            url: "/images/product-not-found.png",
            alt: "Producto no encontrado en iubizon",
          },
        ],
        site: "@iubizon",
      },
      authors: [{ name: "iubizon", url: "https://www.iubizon.com" }],
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

  const title = `Solicita demo de ${product.name ?? "producto"} | iubizon`;
  const description =
    product.note ??
    `Agenda una demostración del ${product.name ?? "producto"} y conoce todos sus beneficios.`;

  return {
    title,
    description,
    keywords: [
      "demo",
      "demostración",
      product.name ?? "",
      product.brand ?? "",
      "iubizon",
      "Per\u00fa",
    ].filter(Boolean),
    alternates: {
      canonical: `https://www.iubizon.com/demo/${product.id ?? ""}`,
    },
    openGraph: {
      type: "website",
      title,
      url: `https://www.iubizon.com/demo/${product.id ?? ""}`,
      description,
      images: [
        {
          url: product.mainImage || "/images/product-not-found.png",
          width: 1200,
          height: 630,
          alt: `${product.name ?? "Producto"} en iubizon`,
        },
      ],
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: product.mainImage || "/images/product-not-found.png",
          alt: `${product.name ?? "Producto"} en iubizon`,
        },
      ],
      site: "@iubizon",
    },
    authors: [{ name: "iubizon", url: "https://www.iubizon.com" }],
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

export default async function DemoProductPage({ params }: Props) {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return <NoFoundComponent />;
  }

  return <DemoProductClientPage product={product} />;
}
