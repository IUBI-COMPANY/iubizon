import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryBySlug(slug: string) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  return data;
}

async function getProductsByCategory(categoryId: string) {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*), seller:profiles(*), images:product_images(*)')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return data || [];
}

async function getAllCategories() {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  return data || [];
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, allCategories] = await Promise.all([
    getCategoryBySlug(slug),
    getAllCategories(),
  ]);

  const products = category ? await getProductsByCategory(category.id) : [];

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <CategoryNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#112237] mb-4">Categoría no encontrada</h2>
            <Link href="/categories" className="text-[#f25c05] hover:underline">
              Ver todas las categorías
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const childCategories = allCategories.filter((c: any) => c.parent_id === category.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <nav className="mb-6">
            <Link href="/categories" className="text-[#64748b] hover:text-[#f25c05]">
              ← Volver a categorías
            </Link>
          </nav>

          <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{category.icon || '📁'}</div>
              <div>
                <h1 className="text-2xl font-bold text-[#112237]">{category.name}</h1>
                <p className="text-[#64748b]">{products.length} productos</p>
              </div>
            </div>
          </div>

          {childCategories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-[#112237] mb-4">Subcategorías</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {childCategories.map((cat: any) => (
                  <Link 
                    key={cat.id} 
                    href={`/categories/${cat.slug}`}
                    className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="text-2xl mb-2">{cat.icon || '📁'}</div>
                    <h3 className="font-medium text-[#112237]">{cat.name}</h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product: any) => {
                const images = [...(product.images || [])].sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
                const firstImage = images[0]?.url;
                
                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="block">
                    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square relative bg-[#f8fafc]">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            📦
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-[#112237] truncate text-sm">{product.title}</h3>
                        <p className="text-[#f25c05] font-bold">S/ {product.price}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-12 text-center">
              <p className="text-[#64748b]">No hay productos en esta categoría</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}