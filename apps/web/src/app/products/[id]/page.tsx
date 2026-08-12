import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Script from "next/script";
import { Metadata } from "next";
import {
  MapPin,
  Eye,
  PackageCheck,
  Package,
  Handshake,
  Truck,
  ShieldCheck,
  ThumbsUp,
  Sparkles,
  Wrench,
  Clock,
  Info,
  FileText,
} from "lucide-react";
import { ProductImageGallery } from "@/components/features/products/ProductImageGallery";
import { ProductActionsBlock } from "./ProductActionsBlock";
import { FavoriteButton } from "./FavoriteButton";
import { getCategoryIcon } from "@/lib/utils/categoryIcons";
import { stockLabel } from "@/lib/utils/stockLabel";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.iubizon.com";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Producto no encontrado | iubizon",
    };
  }

  const title = `${product.title} | Compre en iubizon`;
  const description = product.description
    ? product.description.replace(/<[^>]*>/g, "").substring(0, 160)
    : `Adquiera ${product.title} al mejor precio en la tienda de iubizon.`;
  const mainImage = product.images?.[0]?.url || `${baseUrl}/og-image.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/products/${product.id}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/products/${product.id}`,
      images: [{ url: mainImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [mainImage],
    },
  };
}

async function getProduct(id: string) {
  try {
    const raw = await prisma.product.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo_url: true,
            location: true,
            is_verified: true,
            is_personal: true,
          },
        },
        creator: {
          select: { id: true, name: true, email: true, avatar_url: true },
        },
        category: true,
        images: { orderBy: { position: "asc" } },
      },
    });

    if (!raw) return null;

    return {
      ...raw,
      price: Number(raw.price),
      location: raw.company?.location ?? null,
      delivery_preference: ["pickup", "delivery"],
      availability_type: (raw.stock ?? 1) > 0 ? "available" : "on_order",
    } as any;
  } catch (error) {
    console.error("Error fetching product with Prisma:", error);
    return null;
  }
}

const conditionConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  new: { label: "Nuevo", color: "#10b981", bg: "#10b98110", icon: Sparkles },
  like_new: {
    label: "Como nuevo",
    color: "#3b82f6",
    bg: "#3b82f610",
    icon: ShieldCheck,
  },
  good: {
    label: "Buen estado",
    color: "#f59e0b",
    bg: "#f59e0b10",
    icon: ThumbsUp,
  },
  fair: { label: "Aceptable", color: "#ef4444", bg: "#ef444410", icon: Wrench },
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-2">
              Producto no encontrado
            </h2>
            <p className="text-[#64748b] mb-4">
              El producto que buscas no existe o ha sido eliminado.
            </p>
            <Link href="/search">
              <Button>Ver catálogo de productos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];
  const condition = conditionConfig[product.condition];
  const CategoryIcon = product.category
    ? getCategoryIcon(product.category.slug)
    : null;

  const productSchema = {
    "@context": "https://schema.org" as const,
    "@type": "Product" as const,
    name: product.title,
    image: images.map((img: any) => img.url),
    description: product.description
      ? product.description.replace(/<[^>]*>/g, "")
      : "",
    category: product.category?.name,
    offers: {
      "@type": "Offer" as const,
      price: product.price,
      priceCurrency: "PEN",
      availability:
        (product.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${baseUrl}/products/${product.id}`,
    },
    brand: {
      "@type": "Brand" as const,
      name: product.company?.name || "iubizon",
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 bg-[#f8fafc]">
        <div className="container py-6">
          <nav className="mb-6">
            <Link
              href="/search"
              className="text-[#64748b] hover:text-[#f25c05] transition-colors text-sm"
            >
              ← Volver al catálogo
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column - Images + Details + Description */}
            <div className="lg:col-span-3 space-y-5">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] p-3">
                <ProductImageGallery
                  images={images.map((img: any) => ({
                    id: img.id,
                    url: img.url,
                  }))}
                  title={product.title}
                  videoUrl={product.video_url}
                />
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                <h2 className="text-base font-semibold text-[#112237] mb-4">
                  Detalles del producto
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Condition */}
                  <div
                    className={`flex items-center gap-2.5 p-3 rounded-xl ${condition ? "" : "bg-[#f8fafc]"}`}
                  >
                    {condition ? (
                      <>
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: condition.bg }}
                        >
                          <condition.icon
                            className="w-4.5 h-4.5"
                            style={{ color: condition.color }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-[#64748b]">Condición</p>
                          <p className="text-sm font-medium text-[#112237]">
                            {condition.label}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#f8fafc]">
                          <Package className="w-4.5 h-4.5 text-[#94a3b8]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#64748b]">Condición</p>
                          <p className="text-sm font-medium text-[#112237]">
                            {product.condition}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Category */}
                  {product.category && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#f25c05]/10">
                        {CategoryIcon && (
                          <CategoryIcon className="w-4.5 h-4.5 text-[#f25c05]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b]">Categoría</p>
                        <Link
                          href={`/search?category_id=${product.category.id}`}
                          className="text-sm font-medium text-[#f25c05] hover:underline"
                        >
                          {product.category.name}
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Stock */}
                  {(() => {
                    const s = stockLabel(product.stock);
                    return (
                      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc]">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${s.color}15` }}
                        >
                          <PackageCheck
                            className="w-4.5 h-4.5"
                            style={{ color: s.color }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-[#64748b]">
                            Disponibilidad
                          </p>
                          <p
                            className="text-sm font-bold"
                            style={{ color: s.color }}
                          >
                            {s.label}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Views */}
                <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex items-center gap-4 text-xs text-[#94a3b8]">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{product.views || 0} vistas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Publicado recientemente</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                  <h2 className="text-base font-semibold text-[#112237] mb-3">
                    Descripción
                  </h2>
                  <div
                    className="tiptap-content prose prose-sm max-w-none text-[#112237] whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>

            {/* Right column - Sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 sticky top-4 space-y-4 shadow-sm">
                {/* Vendedor / Empresa */}
                {product.company ? (
                  <Link
                    href={`/companies/${product.company.slug || product.company.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-all group"
                  >
                    <div className="relative w-9 h-9 rounded-full bg-[#f25c05] text-white flex items-center justify-center text-xs font-bold overflow-hidden shrink-0 shadow-sm">
                      {product.company.logo_url ? (
                        <img
                          src={product.company.logo_url}
                          alt={product.company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{product.company.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                        Tienda Oficial
                      </p>
                      <p className="font-bold text-xs text-[#112237] group-hover:text-[#f25c05] truncate transition-colors">
                        {product.company.name}
                      </p>
                    </div>
                  </Link>
                ) : product.creator ? (
                  <Link
                    href={`/user/profile/${product.creator.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] transition-all group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#f25c05]/10 flex items-center justify-center text-xs font-bold text-[#f25c05] shrink-0">
                      {product.creator.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                        Publicado por
                      </p>
                      <p className="font-bold text-xs text-[#112237] group-hover:text-[#f25c05] truncate transition-colors">
                        {product.creator.name || "Usuario"}
                      </p>
                    </div>
                  </Link>
                ) : null}

                {/* Título del Producto */}
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-xl font-bold text-[#112237] leading-tight">
                    {product.title}
                  </h1>
                  <FavoriteButton productId={product.id} />
                </div>

                {/* Bloque de Precio */}
                <div className="py-1">
                  <p className="text-3xl font-black text-[#f25c05] leading-none">
                    S/{" "}
                    {Number(product.price).toLocaleString("es-PE", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                {/* Badges de Estado y Disponibilidad */}
                {condition && (
                  <div className="flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        backgroundColor: condition.bg,
                        color: condition.color,
                      }}
                    >
                      <condition.icon className="w-3.5 h-3.5" />
                      {condition.label}
                    </span>
                    {product.availability_type === "available" && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#3b82f6]/10 text-[#3b82f6]">
                        <PackageCheck className="w-3.5 h-3.5" />
                        Disponible
                      </span>
                    )}
                  </div>
                )}

                {/* Selector de Cantidad y Botón de Agregar al Carrito (Tiempo Real) */}
                {product.creator && (
                  <ProductActionsBlock
                    productId={product.id}
                    productTitle={product.title}
                    productPrice={Number(product.price)}
                    companyId={product.company_id}
                    images={product.images}
                    initialStock={product.stock ?? 1}
                    initialStatus={product.status || "active"}
                  />
                )}
              </div>

              {/* Garantía del Vendedor y Protección Iubizon */}
              {(() => {
                const specs =
                  product.specifications &&
                  typeof product.specifications === "object"
                    ? (product.specifications as Record<string, unknown>)
                    : null;
                const warrantyText = specs?.warranty
                  ? String(specs.warranty)
                  : null;
                const warrantyConditions = specs?.warranty_conditions
                  ? String(specs.warranty_conditions)
                  : null;
                const hasSellerWarranty =
                  !!warrantyText &&
                  !warrantyText.toLowerCase().includes("sin garantía");

                return (
                  <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm space-y-3.5">
                    {hasSellerWarranty ? (
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-[#f25c05]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-5 h-5 text-[#f25c05]" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-[#112237] text-xs uppercase tracking-wider">
                            Garantía del Vendedor
                          </p>
                          <p className="text-xs text-[#334155] font-semibold">
                            {warrantyText}
                          </p>
                          <p className="text-[11px] text-[#64748b] flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-[#f25c05] shrink-0 inline" />
                            <span>
                              <strong className="text-[#334155]">
                                Cobertura:
                              </strong>{" "}
                              Fallas de fabricación y componentes defectuosos de
                              origen.
                            </span>
                          </p>
                          {warrantyConditions && (
                            <p className="text-[11px] text-[#64748b] flex items-center gap-1">
                              <FileText className="w-3.5 h-3.5 text-[#f25c05] shrink-0 inline" />
                              <span>
                                <strong className="text-[#334155]">
                                  Condiciones:
                                </strong>{" "}
                                {warrantyConditions}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 text-xs text-[#64748b]">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                          <ShieldCheck className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-[#112237] text-xs uppercase tracking-wider">
                            Garantía del Vendedor
                          </p>
                          <p className="text-xs text-[#64748b] mt-0.5">
                            Este producto no incluye garantía extendida
                            adicional del vendedor.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#f1f5f9] pt-3 flex items-start gap-2.5 text-xs text-[#64748b]">
                      <div className="w-2 h-2 rounded-full bg-[#10b981] shrink-0 mt-1.5" />
                      <span>
                        <strong className="text-[#112237]">
                          Protección al Comprador Iubizon:
                        </strong>{" "}
                        Cobertura de 7 días para verificar la entrega e
                        idoneidad del producto.
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
        strategy="beforeInteractive"
      />
    </div>
  );
}
