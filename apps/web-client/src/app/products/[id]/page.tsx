import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
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
} from 'lucide-react';
import { ProductImageGallery } from '@/components/features/products/ProductImageGallery';
import { ChatButton } from './ChatButton';
import { BuyButton } from './BuyButton';
import { FavoriteButton } from './FavoriteButton';
import { getCategoryIcon } from '@/lib/utils/categoryIcons';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    const raw = await prisma.product.findUnique({
      where: { id },
      include: {
        seller: true,
        category: true,
        images: { orderBy: { position: 'asc' } },
      },
    });

    if (!raw) return null;

    return {
      ...raw,
      price: Number(raw.price),
      location: raw.seller?.location ?? null,
      delivery_preference: ['pickup', 'delivery'],
      availability_type: (raw.stock ?? 1) > 0 ? 'available' : 'on_order',
    } as any;
  } catch (error) {
    console.error('Error fetching product with Prisma:', error);
    return null;
  }
}

const conditionConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  new: { label: 'Nuevo', color: '#10b981', bg: '#10b98110', icon: Sparkles },
  like_new: { label: 'Como nuevo', color: '#3b82f6', bg: '#3b82f610', icon: ShieldCheck },
  good: { label: 'Buen estado', color: '#f59e0b', bg: '#f59e0b10', icon: ThumbsUp },
  fair: { label: 'Aceptable', color: '#ef4444', bg: '#ef444410', icon: Wrench },
};

const deliveryLabels: Record<string, { label: string; icon: React.ElementType }> = {
  public_meetup: { label: 'Encuentro en lugar público', icon: Handshake },
  pickup: { label: 'Retiro en puerta', icon: MapPin },
  delivery: { label: 'Entrega a puerta', icon: Truck },
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
            <h2 className="text-2xl font-bold text-[#112237] mb-2">Producto no encontrado</h2>
            <p className="text-[#64748b] mb-4">El producto que buscas no existe o ha sido eliminado.</p>
            <Link href="/products">
              <Button>Ver todos los productos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images || [];
  const condition = conditionConfig[product.condition];
  const CategoryIcon = product.category ? getCategoryIcon(product.category.slug) : null;

  const deliveryPrefs: string[] = Array.isArray(product.delivery_preference)
    ? product.delivery_preference
    : typeof product.delivery_preference === 'string'
    ? product.delivery_preference.split(',').filter(Boolean).map((p: string) => p.trim())
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <nav className="mb-6">
            <Link href="/products" className="text-[#64748b] hover:text-[#f25c05] transition-colors text-sm">
              ← Volver a productos
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left column - Images + Details + Description */}
            <div className="lg:col-span-3 space-y-5">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl overflow-hidden border border-[#e2e8f0] p-3">
                <ProductImageGallery 
                  images={images.map((img: any) => ({ id: img.id, url: img.url }))}
                  title={product.title}
                />
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                <h2 className="text-base font-semibold text-[#112237] mb-4">Detalles del producto</h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* Condition */}
                  <div className={`flex items-center gap-2.5 p-3 rounded-xl ${condition ? '' : 'bg-[#f8fafc]'}`}>
                    {condition ? (
                      <>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: condition.bg }}>
                          <condition.icon className="w-4.5 h-4.5" style={{ color: condition.color }} />
                        </div>
                        <div>
                          <p className="text-xs text-[#64748b]">Condición</p>
                          <p className="text-sm font-medium text-[#112237]">{condition.label}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#f8fafc]">
                          <Package className="w-4.5 h-4.5 text-[#94a3b8]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#64748b]">Condición</p>
                          <p className="text-sm font-medium text-[#112237]">{product.condition}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Category */}
                  {product.category && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#f25c05]/10">
                        {CategoryIcon && <CategoryIcon className="w-4.5 h-4.5 text-[#f25c05]" />}
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

                  {/* Availability */}
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc]">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#f25c05]/10">
                      {product.availability_type === 'available' ? (
                        <PackageCheck className="w-4.5 h-4.5 text-[#f25c05]" />
                      ) : (
                        <Package className="w-4.5 h-4.5 text-[#f25c05]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[#64748b]">Disponibilidad</p>
                      <p className="text-sm font-medium text-[#112237]">
                        {product.availability_type === 'available' ? 'Disponible' : 'Artículo único'}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {product.location && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f8fafc]">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[#3b82f6]/10">
                        <MapPin className="w-4.5 h-4.5 text-[#3b82f6]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#64748b]">Ubicación</p>
                        <p className="text-sm font-medium text-[#112237]">{product.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery Preferences */}
                {deliveryPrefs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
                    <p className="text-xs text-[#64748b] mb-2.5">Formas de entrega</p>
                    <div className="flex flex-wrap gap-2">
                      {deliveryPrefs.map((pref: string) => {
                        const config = deliveryLabels[pref];
                        if (!config) return null;
                        const Icon = config.icon;
                        return (
                          <span
                            key={pref}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0] text-xs font-medium text-[#112237]"
                          >
                            <Icon className="w-3.5 h-3.5 text-[#f25c05]" />
                            {config.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  <h2 className="text-base font-semibold text-[#112237] mb-3">Descripción</h2>
                  <div
                    className="tiptap-content prose prose-sm max-w-none text-[#112237]"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>

            {/* Right column - Sidebar */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sticky top-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="text-xl font-bold text-[#112237] leading-tight">{product.title}</h1>
                  <FavoriteButton productId={product.id} />
                </div>

                <p className="text-3xl font-bold text-[#f25c05] mb-4">
                  S/ {Number(product.price).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </p>

                {condition && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                      style={{ backgroundColor: condition.bg, color: condition.color }}
                    >
                      <condition.icon className="w-3.5 h-3.5" />
                      {condition.label}
                    </span>
                    {product.availability_type === 'available' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#3b82f6]/10 text-[#3b82f6]">
                        <PackageCheck className="w-3.5 h-3.5" />
                        Disponible
                      </span>
                    )}
                  </div>
                )}

                {product.location && (
                  <div className="flex items-center gap-2 text-sm text-[#64748b] mb-5 pb-5 border-b border-[#e2e8f0]">
                    <MapPin className="w-4 h-4 text-[#f25c05] shrink-0" />
                    <span>{product.location}</span>
                  </div>
                )}

                <div className="space-y-3">
                  {product.seller && (
                    <>
                      <BuyButton 
                        productId={product.id}
                        productTitle={product.title}
                        productPrice={product.price}
                        sellerId={product.seller.id}
                      />
                      <ChatButton 
                        sellerId={product.seller.id}
                        productId={product.id}
                        productTitle={product.title}
                      />
                    </>
                  )}
                </div>
              </div>

              {product.seller && (
                <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                  <h3 className="text-sm font-medium text-[#64748b] mb-3">Vendido por</h3>
                  <Link href={`/user/profile/${product.seller.id}`}>
                    <div className="flex items-center gap-3 hover:bg-[#f8fafc] -m-2 p-2 rounded-xl transition-colors">
                      <div className="w-11 h-11 rounded-full bg-[#f25c05]/10 flex items-center justify-center text-lg font-semibold text-[#f25c05]">
                        {product.seller.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-[#112237]">
                          {product.seller.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {product.seller.total_sales || 0} ventas
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
                <div className="flex items-center gap-3 text-sm text-[#64748b]">
                  <div className="w-10 h-10 bg-[#10b981]/10 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#112237]">Compra segura</p>
                    <p className="text-xs text-[#94a3b8]">Protección en cada transacción</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}