import { getActiveProducts } from "@/lib/supabase/server";
import { getPopularCategories } from "@/lib/services/categories";
import { Navbar } from "@/components/features/layout/Navbar";
import { CategoryCarousel } from "@/components/features/categories/CategoryCarousel";
import { Footer } from "@/components/features/layout/Footer";
import { HeroSection } from "@/components/features/home/HeroSection";
import { ProductCard } from "@/components/ui/ProductCard";

export const dynamic = "force-dynamic";

export default async function MarketplaceHomePage() {
  const [products, popularCategories] = await Promise.all([
    getActiveProducts(),
    getPopularCategories(6),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="grow">
        <HeroSection />

        {/* Categorías Populares */}
        {popularCategories.length > 0 && (
          <section className="py-6 bg-[#f8fafc]">
            <div className="container mx-auto px-4">
              <h2 className="text-lg font-bold text-[#112237] mb-4">
                Categorías populares
              </h2>
              <CategoryCarousel categories={popularCategories} />
            </div>
          </section>
        )}

        <section className="py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-[#112237] mb-6">
              Últimos productos publicados
            </h2>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="text-center text-[#64748b]">
                No hay productos disponibles
              </p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
