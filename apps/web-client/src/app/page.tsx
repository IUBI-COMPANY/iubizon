import { getActiveProducts } from '@/lib/supabase/server';
import { Navbar } from '@/components/features/layout/Navbar';
import { CategoryNav } from '@/components/features/categories/CategoryNav';
import { Footer } from '@/components/features/layout/Footer';
import { HeroSection } from '@/components/features/home/HeroSection';
import { ProductGrid } from '@/components/features/products/ProductGrid';

export const dynamic = 'force-dynamic';

export default async function MarketplaceHomePage() {
  const products = await getActiveProducts();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <CategoryNav />
      <main className="grow">
        <HeroSection />
        
        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-[#112237] mb-6">Últimos productos publicados</h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map(product => (
                  <a key={product.id} href={`/products/${product.id}`} className="block">
                    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-[#f8fafc] rounded-lg mb-3 flex items-center justify-center text-4xl">
                        📦
                      </div>
                      <h3 className="font-medium text-[#112237] truncate">{product.title}</h3>
                      <p className="text-[#f25c05] font-bold">S/ {product.price}</p>
                      <span className="text-xs text-[#64748b] capitalize">{(product.condition || '').replace('_', ' ')}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#64748b]">No hay productos disponibles</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}