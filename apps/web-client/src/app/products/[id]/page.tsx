import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { Footer } from '@/components/features/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Heart, MessageCircle, MapPin, Eye } from 'lucide-react';
import { ProductImageGallery } from '@/components/features/products/ProductImageGallery';
import { ChatButton } from './ChatButton';
import { BuyButton } from './BuyButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, seller:profiles(*), category:categories(*), images:product_images(*), bundle:product_bundles(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data;
}

const conditionLabels: Record<string, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Aceptable',
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-6">
          <nav className="mb-6">
            <Link href="/products" className="text-[#64748b] hover:text-[#f25c05]">
              ← Volver a productos
            </Link>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl overflow-hidden border border-[#e2e8f0] p-4">
                <ProductImageGallery 
                  images={images.map((img: any) => ({ id: img.id, url: img.url }))}
                  title={product.title}
                />
              </div>

              <div className="bg-white rounded-xl border border-[#e2e8f0] mt-6 p-6">
                <h2 className="text-lg font-semibold text-[#112237] mb-4">Descripción</h2>
                <p className="text-[#64748b] whitespace-pre-wrap">{product.description || 'Sin descripción'}</p>
                
                <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
                  <h3 className="text-sm font-medium text-[#112237] mb-3">Detalles del producto</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#64748b]">Condición:</span>
                      <span className="ml-2 font-medium text-[#112237]">
                        {conditionLabels[product.condition] || product.condition}
                      </span>
                    </div>
                    {product.category && (
                      <div>
                        <span className="text-[#64748b]">Categoría:</span>
                        <Link
                          href={`/categories/${product.category.slug}`}
                          className="ml-2 text-[#f25c05] hover:underline"
                        >
                          {product.category.name}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-[#112237]">{product.title}</h1>
                  <button className="p-2 rounded-full hover:bg-[#f8fafc]">
                    <Heart className="w-6 h-6 text-[#64748b]" />
                  </button>
                </div>

                <p className="text-3xl font-bold text-[#f25c05] mb-4">
                  S/ {product.price}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant={product.is_bundle ? 'default' : 'success'}>
                    {product.is_bundle ? 'LOTE' : conditionLabels[product.condition] || product.condition}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-[#64748b] mb-6">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>Lima</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{product.views || 0} vistas</span>
                  </div>
                </div>

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
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                  <h3 className="text-sm font-medium text-[#64748b] mb-4">Vendido por</h3>
                  <Link href={`/user/profile/${product.seller.id}`}>
                    <div className="flex items-center gap-3 hover:bg-[#f8fafc] -m-2 p-2 rounded-lg transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#f8fafc] flex items-center justify-center text-xl">
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

              <div className="bg-white rounded-xl border border-[#e2e8f0] p-6">
                <div className="flex items-center gap-3 text-sm text-[#64748b]">
                  <div className="w-10 h-10 bg-[#10b981]/10 rounded-full flex items-center justify-center">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#112237]">Compra segura</p>
                    <p className="text-xs">Protección en cada transacción</p>
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