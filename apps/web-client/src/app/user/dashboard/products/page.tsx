"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";

interface UserProduct {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  views: number;
  category: string | null;
  images: Array<{ id: string; url: string; position: number }>;
  created_at: string;
}

export default function ProductsManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { activeCompany, isLoadingCompanies } = useCompany();

  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const url = activeCompany?.id
        ? `/api/user/products?company_id=${activeCompany.id}`
        : `/api/user/products`;

      const res = await fetch(url);
      const json = await res.json();

      if (res.ok && Array.isArray(json.products)) {
        setProducts(json.products);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
    } finally {
      setLoading(false);
    }
  }, [user, activeCompany?.id]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, activeCompany?.id, fetchProducts]);

  if (authLoading || isLoadingCompanies) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm max-w-md w-full">
            <UserIcon className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#112237] mb-2">
              Inicia sesión
            </h2>
            <Link
              href="/auth/login?redirect=/user/dashboard/products"
              className="inline-block bg-[#f25c05] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#d94d04] transition-all shadow-md w-full"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/user/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#112237] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-[#112237]">
                {activeCompany ? `Productos de ${activeCompany.name}` : "Mis Productos Personales"}
              </h1>
              {activeCompany && (
                <p className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-[#f25c05]" />
                  <span>Catálogo oficial de {activeCompany.name}</span>
                </p>
              )}
            </div>
          </div>

          <Link
            href="/products/new"
            className="flex items-center gap-2 bg-[#f25c05] hover:bg-[#d94d04] text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Nuevo producto
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#f25c05] mb-3" />
            <p className="text-xs text-[#64748b]">Cargando catálogo...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#f1f5f9] text-xs font-bold uppercase tracking-wider text-[#64748b]">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2">Precio</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-3 text-right">Acciones</div>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {products.map((product) => {
                const mainImage = product.images?.[0]?.url;

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-[#f8fafc] rounded-xl overflow-hidden shrink-0 border border-[#e2e8f0] flex items-center justify-center">
                        {mainImage ? (
                          <>
                            <Image
                              src={mainImage}
                              alt={product.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            {product.images.length > 1 && (
                              <div className="absolute bottom-1 right-1 bg-[#f25c05] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                                +{product.images.length - 1}
                              </div>
                            )}
                          </>
                        ) : (
                          <Package className="w-6 h-6 text-[#cbd5e1]" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[#112237] line-clamp-1">
                          {product.title}
                        </p>
                        <p className="text-xs text-[#64748b]">
                          {product.condition === "new"
                            ? "Nuevo"
                            : product.condition === "like_new"
                              ? "Como nuevo"
                              : product.condition === "good"
                                ? "Buen estado"
                                : "Aceptable"}
                        </p>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="font-bold text-[#112237] text-sm">
                        S/ {product.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          product.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : product.status === "sold"
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {product.status === "active"
                          ? "Activo"
                          : product.status === "sold"
                            ? "Vendido"
                            : "Inactivo"}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#112237] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </Link>
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#f25c05] hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center shadow-sm">
            <Package className="w-12 h-12 mx-auto text-[#cbd5e1] mb-3" />
            <h2 className="text-lg font-bold text-[#112237] mb-1">
              No hay productos registrados
            </h2>
            <p className="text-xs text-[#64748b] mb-6">
              {activeCompany
                ? `Aún no hay productos publicados para ${activeCompany.name}`
                : "Aún no tienes publicaciones como vendedor personal"}
            </p>
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 bg-[#f25c05] text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-[#d94d04] transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Publicar primer producto
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}