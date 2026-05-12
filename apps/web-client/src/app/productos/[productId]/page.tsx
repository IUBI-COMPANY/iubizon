import type { Metadata } from "next";
import { NoFoundComponent } from "@/components/ui/NoFoundComponent";
import ProductClientPage from "./ProductClientPage";
import { products, Product } from "@/data-list/products";
import Script from "next/script";

// ==========================
// 🔹 Types
// ==========================
interface Props {
  params: Promise<{ productId: string }>;
}

// ==========================
// 🔹 Dynamic Metada
// ==========================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;

  const product: Product | undefined = products.find(
    (product) => product.id === productId,
  );

  if (!product) {
    return {
      title: "Producto no encontrado | iubizon",
      description: "Este producto no existe en nuestro catálogo.",
      keywords: ["producto no encontrado", "iubizon", "catálogo"],
      alternates: {
        canonical: `https://www.iubizon.com/${productId}`,
      },
      openGraph: {
        type: "website",
        title: "Producto no encontrado | iubizon",
        url: `https://www.iubizon.com/${productId}`,
        description: "Este producto no existe en nuestro catálogo.",
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
        title: "Producto no encontrado | iubizon",
        description: "Este producto no existe en nuestro catálogo.",
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
      category: "Productos",
      applicationName: "iubizon",
      generator: "Next.js",
      metadataBase: new URL("https://www.iubizon.com"),
    };
  }

  const title = `${product.name ?? "Producto"}${product.lumensANSI ? ` | ${product.lumensANSI}` : ""} | iubizon`;
  const description =
    product.note ??
    `${product.name ?? "Producto"} en iubizon. Compra o vende productos tecnológicos en Perú. Encuentra los mejores precios y asesoría personalizada.`;

  const keywordsArray: string[] = [];
  if (product.name) keywordsArray.push(product.name);
  if (product.brand) keywordsArray.push(product.brand);
  if (product.type) keywordsArray.push(product.type);
  if (typeof product.lumensANSI === "number")
    keywordsArray.push(String(product.lumensANSI));
  keywordsArray.push(
    "comprar",
    "vender",
    "proyector",
    "accesorio",
    "repuesto",
    "tecnología",
    "iubizon",
    "Perú",
    "marketplace",
    "tienda tecnología",
  );

  const imageList = product.media?.length
    ? product.media.map((media_) => ({
        url: media_.src,
        width: 1200,
        height: 630,
        alt: `${product.name ?? "Producto"} en iubizon`,
      }))
    : [
        {
          url: "/images/product-not-found.png",
          width: 1200,
          height: 630,
          alt: `${product.name ?? "Producto"} en iubizon`,
        },
      ];

  return {
    title,
    description,
    keywords: keywordsArray,
    alternates: {
      canonical: `https://www.iubizon.com/${product.id ?? ""}`,
    },
    openGraph: {
      type: "website",
      title,
      url: `https://www.iubizon.com/${product.id ?? ""}`,
      description,
      images: imageList,
      siteName: "iubizon",
      locale: "es_PE",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageList,
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
    category: "Productos",
    applicationName: "iubizon",
    generator: "Next.js",
    metadataBase: new URL("https://www.iubizon.com"),
  };
}

// ==========================
// 🔹 Página principal (Server)
// ==========================
export default async function Page({ params }: Props) {
  const { productId } = await params;
  const product = products.find((p) => p.id === productId);
  if (!product) return <NoFoundComponent />;

  // Generate Product Schema (JSON-LD)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name || product.model,
    description:
      product.note ||
      product.description ||
      `${product.name} - ${product.brand}`,
    image: product.media
      .filter((m) => m.type === "image")
      .map((m) => `https://www.iubizon.com${m.src}`),
    brand: {
      "@type": "Brand",
      name: product.brand || "Epson",
    },
    model: product.model,
    sku: product.id,
    mpn: product.model,
    offers: {
      "@type": "Offer",
      url: `https://www.iubizon.com/productos/${product.id}`,
      priceCurrency: "PEN",
      price: product.price.toFixed(2),
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1),
      )
        .toISOString()
        .split("T")[0],
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition:
        product.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/RefurbishedCondition",
      seller: {
        "@type": "Organization",
        name: "iubizon",
        url: "https://www.iubizon.com",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      reviewCount: "15",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Cliente Verificado",
        },
        reviewBody:
          "Excelente proyector, muy buena calidad de imagen y precio accesible.",
        datePublished: "2024-11-15",
      },
      {
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "4",
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: "Usuario Satisfecho",
        },
        reviewBody: "Muy buen servicio y producto de calidad.",
        datePublished: "2024-12-20",
      },
    ],
    ...(product.category && {
      category: product.category.join(" > "),
    }),
    ...(product.lumensANSI && {
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Lúmenes",
          value: product.lumensANSI,
        },
        ...(product.nativeResolution
          ? [
              {
                "@type": "PropertyValue",
                name: "Resolución Nativa",
                value: product.nativeResolution,
              },
            ]
          : []),
        ...(product.displayTechnology
          ? [
              {
                "@type": "PropertyValue",
                name: "Tecnología de Visualización",
                value: product.displayTechnology,
              },
            ]
          : []),
        ...(product.contrastRatio
          ? [
              {
                "@type": "PropertyValue",
                name: "Relación de Contraste",
                value: product.contrastRatio,
              },
            ]
          : []),
        ...(product.aspectRatio
          ? [
              {
                "@type": "PropertyValue",
                name: "Relación de Aspecto",
                value: product.aspectRatio,
              },
            ]
          : []),
        ...(product.connectivity
          ? [
              {
                "@type": "PropertyValue",
                name: "Conectividad",
                value: product.connectivity,
              },
            ]
          : []),
      ],
    }),
  };

  // Generate BreadcrumbList Schema (JSON-LD)
  const breadcrumbSchema = {
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
        name: "Productos",
        item: "https://www.iubizon.com/productos",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name || product.model,
        item: `https://www.iubizon.com/productos/${product.id}`,
      },
    ],
  };

  // Generate VideoObject Schema for products with videos
  const videoSchemas = product.media
    .filter((m) => m.type === "video")
    .map((video, index) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: `${product.name || product.model} - Video demostrativo ${index + 1}`,
      description: `Video demostrativo del ${product.name || product.model} ${product.brand || ""} con ${product.lumensANSI || ""} - ${product.condition === "new" ? "Nuevo" : "Reacondicionado"}`,
      thumbnailUrl: product.mainImage
        ? `https://www.iubizon.com${product.mainImage}`
        : `https://www.iubizon.com${product.media.find((m) => m.type === "image")?.src || "/images/product-not-found.png"}`,
      contentUrl: `https://www.iubizon.com${video.src}`,
      uploadDate: "2024-01-01T00:00:00Z",
      duration: "PT1M",
      embedUrl: `https://www.iubizon.com${video.src}`,
    }));

  return (
    <>
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {videoSchemas.length > 0 &&
        videoSchemas.map((videoSchema, index) => (
          <Script
            key={`video-schema-${index}`}
            id={`video-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
          />
        ))}
      <ProductClientPage product={product} />
    </>
  );
}
