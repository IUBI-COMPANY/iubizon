import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

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

export default async function ProductsPage() {
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
              {products.map(product => (
                <Link key={product.id} href={`/products/${product.id}`} className="block">
                  <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-[#f8fafc] rounded-lg mb-3 flex items-center justify-center text-4xl">
                      📦
                    </div>
                    <h3 className="font-medium text-[#112237] truncate">{product.title}</h3>
                    <p className="text-[#f25c05] font-bold">S/ {product.price}</p>
                    <span className="text-xs text-[#64748b] capitalize">
                      {(product.condition || '').replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
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