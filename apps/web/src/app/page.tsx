import Link from "next/link";
import { ChevronRight, Flame } from "lucide-react";
import {
  getActiveProducts,
  getBestSellingProducts,
} from "@/lib/services/products";
import { getPopularCategories } from "@/lib/services/categories";
import { Navbar } from "@/components/features/layout/Navbar";
import { CategoryCarousel } from "@/components/features/categories/CategoryCarousel";
import { Footer } from "@/components/features/layout/Footer";
import { HeroSection } from "@/components/features/home/HeroSection";
import { PaymentMethodsSection } from "@/components/features/home/PaymentMethodsSection";
import { FaqSection } from "@/components/features/home/FaqSection";
import { ProductCard } from "@/components/ui/ProductCard";
import { Alert } from "@/components/ui/Alert";
import type { Category } from "@/types";

export const revalidate = 60;

interface CategoryWithStats extends Category {
  product_count: number;
  sales_count: number;
}

export default async function MarketplaceHomePage() {
  const [productsRes, popularProductsRes, categoriesRes] =
    await Promise.allSettled([
      getActiveProducts(10),
      getBestSellingProducts(5),
      getPopularCategories(),
    ]);

  const latestProducts =
    productsRes.status === "fulfilled" ? productsRes.value : [];
  const bestSellingProducts =
    popularProductsRes.status === "fulfilled" ? popularProductsRes.value : [];
  const popularCategories: CategoryWithStats[] =
    categoriesRes.status === "fulfilled"
      ? (categoriesRes.value as CategoryWithStats[])
      : [];

  const maintenanceError =
    productsRes.status === "rejected" ||
    popularProductsRes.status === "rejected" ||
    categoriesRes.status === "rejected"
      ? "Estamos realizando tareas de mantenimiento. Algunos datos pueden no estar disponibles."
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="grow">
        <HeroSection />

        {maintenanceError && (
          <div className="container mt-6">
            <Alert variant="warning" message={maintenanceError} />
          </div>
        )}

        {/* Categorías Populares */}
        {popularCategories.length > 0 && (
          <section className="py-6">
            <div className="container">
              <h2 className="text-lg font-bold text-[#112237] mb-4">
                Categorías
              </h2>
              <CategoryCarousel categories={popularCategories} />
            </div>
          </section>
        )}

        {/* Sección: Últimos Productos Publicados */}
        <section className="py-8">
          <div className="container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#112237] flex items-center gap-2">
                  <span>Últimos productos publicados</span>
                </h2>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Las publicaciones más recientes de la plataforma
                </p>
              </div>

              <Link
                href="/search"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#f25c05] hover:text-[#d94d04] transition-colors group px-3 py-1.5 rounded-xl hover:bg-orange-50/60"
              >
                <span>Ver más</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {latestProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {latestProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center text-[#64748b] py-8">
                No hay productos disponibles actualmente.
              </p>
            )}
          </div>
        </section>

        {/* Sección: Los Más Vendidos (solo cuando hay 4 o más productos con 10 o más ventas) */}
        {bestSellingProducts.length >= 4 && (
          <section className="py-8 bg-[#f8fafc]/70 border-y border-[#e2e8f0]/80">
            <div className="container">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#112237] flex items-center gap-2">
                    <Flame className="w-5 h-5 text-[#f25c05]" />
                    <span>Los más vendidos</span>
                  </h2>
                  <p className="text-xs text-[#64748b] mt-0.5">
                    Productos destacados con mayor número de ventas
                  </p>
                </div>

                <Link
                  href="/search?sort=popular"
                  className="inline-flex items-center gap-1 text-sm font-bold text-[#f25c05] hover:text-[#d94d04] transition-colors group px-3 py-1.5 rounded-xl hover:bg-orange-50/60"
                >
                  <span>Ver más</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {bestSellingProducts.map((product) => (
                  <ProductCard key={`best-${product.id}`} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        <PaymentMethodsSection />
        <FaqSection />
      </main>
      <Footer categories={popularCategories} />
    </div>
  );
}
