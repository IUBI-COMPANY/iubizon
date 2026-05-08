import { createServerClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getCategories() {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const techSlugs = ['electronica', 'laptops', 'proyectores', 'moviles', 'consolas', 'tv-audio'];
  const parentCategories = categories.filter((c: any) => !c.parent_id && techSlugs.includes(c.slug));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <CategoryNav />
      
      <div className="flex-1 bg-[#f8fafc]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#112237] mb-2">Categorías de Tecnología</h1>
          <p className="text-[#64748b] mb-8">
            Explora las categorías de tecnología disponibles en Iubizon
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {parentCategories.map((category: any) => (
              <Link 
                key={category.id} 
                href={`/categories/${category.slug}`}
                className="bg-white border border-[#e2e8f0] rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">{category.icon || '📁'}</div>
                <h3 className="font-medium text-[#112237]">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}