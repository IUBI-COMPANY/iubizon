import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Todos los productos | Iubizon Marketplace',
  description: 'Explora todos los productos disponibles en Iubizon. Electrónica, hogar, herramientas y más.',
};

async function getProducts(limit = 20) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*), bundle:product_bundles(*)', {
      count: 'exact',
    })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }

  return { products: data || [], total: data?.length || 0 };
}

export default async function ProductosPage() {
  const { products, total } = await getProducts();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#112237]">Todos los productos</h1>
              <p className="text-[#64748b]">{total} productos disponibles</p>
            </div>
            <Link href="/products/new" className="bg-[#f25c05] text-white px-4 py-2 rounded-lg hover:bg-[#d94d04]">
              + Publicar producto
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => {
                const images = product.images || [];
                
                return (
                <Link key={product.id} href={`/products/${product.id}`} className="block">
                  <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative bg-[#f8fafc]">
                      {images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-0.5 h-full w-full">
                          {images.slice(0, 4).map((img, idx) => (
                            <div key={idx} className="relative overflow-hidden bg-[#f1f5f9]">
                              <Image
                                src={img.url}
                                alt={`${product.title} ${idx + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                          {images.length > 4 && (
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                              +{images.length - 4}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">
                          {product.category?.icon || '📦'}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-[#112237] line-clamp-2 text-sm">{product.title}</h3>
                      <p className="text-[#f25c05] font-bold mt-1">S/ {product.price}</p>
                      <p className="text-xs text-[#64748b] mt-1">{product.category?.name}</p>
                    </div>
                  </div>
                </Link>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#64748b]">No hay productos disponibles</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}