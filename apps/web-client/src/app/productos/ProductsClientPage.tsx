"use client";

import React from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import Image from "next/image";
import { productsCondition } from "@/data-list/productsCondition";
import { products } from "@/data-list/products";
import { Filter, Package, ShoppingCart, Star } from "lucide-react";

export default function ProductsClientPage() {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://www.iubizon.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Productos",
        item: "https://www.iubizon.com/productos",
      },
    ],
  };

  const sortProductsBySpecial = (productsList: typeof products) => {
    return [...productsList].sort((a, b) => {
      if (a.campaign === b.campaign) return 0;
      return a.campaign ? -1 : 1;
    });
  };

  const productsByCondition = {
    new: {
      ...productsCondition.new,
      products: sortProductsBySpecial(
        products.filter((product) => product.condition === "new"),
      ),
    },
    reconditioned: {
      ...productsCondition.reconditioned,
      products: sortProductsBySpecial(
        products.filter((product) => product.condition === "reconditioned"),
      ),
    },
  };

  const stats = {
    total: products.length,
    new: products.filter((p) => p.condition === "new").length,
    reconditioned: products.filter((p) => p.condition === "reconditioned")
      .length,
    totalStock: products.reduce((acc, p) => acc + p.stock, 0),
    brands: [...new Set(products.map((p) => p.brand).filter(Boolean))].length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0a0f1a] via-[#0d1520] to-[#050a12] overflow-hidden">
          {/* Imagen de fondo con overlay oscuro */}
          <div className="absolute inset-0">
            <Image
              src="/images/education-projectors.jpg"
              alt="Catálogo de proyectores Epson nuevos y reacondicionados en Lima - iubizon"
              fill
              sizes="100vw"
              className="object-cover opacity-10"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a]/98 via-[#0d1520]/96 to-[#050a12]/98" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                Nuestros Productos
              </h1>
              <p className="text-xl text-gray-100 max-w-3xl mx-auto mb-8 drop-shadow-lg">
                Descubre nuestra amplia gama de proyectores con ofertas
                especiales.
                <span className="block mt-2 text-blue-300 font-semibold">
                  Garantía extendida y soporte técnico especializado
                </span>
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:bg-white/15">
                  <Package className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white drop-shadow-lg">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-200">Productos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:border-yellow-400/30 transition-all duration-300 hover:scale-105 hover:bg-white/15">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2 animate-pulse" />
                  <div className="text-2xl font-bold text-white drop-shadow-lg">
                    {stats.new}
                  </div>
                  <div className="text-sm text-gray-200">Nuevos</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:border-green-400/30 transition-all duration-300 hover:scale-105 hover:bg-white/15">
                  <ShoppingCart className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white drop-shadow-lg">
                    {stats.reconditioned}
                  </div>
                  <div className="text-sm text-gray-200">Reacondicionados</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border-2 border-white/20 hover:border-blue-400/30 transition-all duration-300 hover:scale-105 hover:bg-white/15">
                  <Filter className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white drop-shadow-lg">
                    {stats.brands}
                  </div>
                  <div className="text-sm text-gray-200">Marcas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Borde decorativo inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/30 to-transparent"></div>
        </section>

        {/* Products Section */}
        <main className="max-w-7xl mx-auto px-4 py-10">
          {/* New Products */}
          {productsByCondition.new.products.length > 0 && (
            <section className="mb-16 relative">
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-8 shadow-sm border-2 border-blue-100/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Star className="w-8 h-8 text-yellow-500" />
                          <div className="absolute inset-0 w-8 h-8 text-yellow-500 blur-sm animate-pulse"></div>
                        </div>
                        <h2 className="text-3xl font-bold text-color-secondary">
                          {productsByCondition.new.name}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                      {productsByCondition.new.description}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                      <span>
                        Llévate tu proyector completamente nuevo con garantía
                        extendida
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {productsByCondition.new.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Reconditioned Products */}
          {productsByCondition.reconditioned.products.length > 0 && (
            <section className="mb-16 relative">
              <div className="bg-gradient-to-br from-white to-gray-50/30 rounded-2xl p-8 shadow-sm border-2 border-gray-100/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <ShoppingCart className="w-8 h-8 text-green-500" />
                          <div className="absolute inset-0 w-8 h-8 text-green-500 blur-sm"></div>
                        </div>
                        <h2 className="text-3xl font-bold text-color-secondary">
                          {productsByCondition.reconditioned.name}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-2 max-w-2xl">
                      {productsByCondition.reconditioned.description}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {productsByCondition.reconditioned.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Guarantee Information */}
          <div className="mt-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 rounded-2xl"></div>
          </div>
        </main>
      </div>
    </>
  );
}
