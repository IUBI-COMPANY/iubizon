import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string; category?: string; minPrice?: string; maxPrice?: string }>;
}

async function getProducts(query: string, categoryId?: string, minPrice?: number, maxPrice?: number) {
  const supabase = createServerClient();
  
  let queryBuilder = supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*), bundle:product_bundles(*)', {
      count: 'exact',
    })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(20);

  if (query) {
    queryBuilder = queryBuilder.ilike('title', `%${query}%`);
  }
  
  if (categoryId) {
    queryBuilder = queryBuilder.eq('category_id', categoryId);
  }
  
  if (minPrice) {
    queryBuilder = queryBuilder.gte('price', minPrice);
  }
  
  if (maxPrice) {
    queryBuilder = queryBuilder.lte('price', maxPrice);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }

  return { products: data || [], total: data?.length || 0 };
}

const conditionLabels: Record<string, string> = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  fair: 'Aceptable',
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, category, minPrice, maxPrice } = await searchParams;
  
  const { products, total } = await getProducts(
    q || '', 
    category,
    minPrice ? parseInt(minPrice) : undefined,
    maxPrice ? parseInt(maxPrice) : undefined
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#112237] mb-4">
              Resultados de búsqueda: <span className="text-[#f25c05]">"{q || ''}"</span>
            </h1>
            <p className="text-[#64748b]">{total} productos encontrados</p>
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
              <p className="text-[#64748b]">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}