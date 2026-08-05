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
import Skeleton from "react-loading-skeleton";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";

interface UserProduct {
  id: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  stock?: number | null;
  views: number;
  category: string | null;
  imageCount: number;
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
    if (!user) return;
    fetchProducts();

    const supabase = createClient();
    const channel = supabase
      .channel("company-products-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "products",
        },
        (payload) => {
          if (payload.new && payload.new.id) {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === payload.new.id
                  ? {
                      ...p,
                      stock:
                        typeof payload.new.stock === "number"
                          ? payload.new.stock
                          : p.stock,
                      status: payload.new.status || p.status,
                    }
                  : p,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/user/dashboard"
                className="inline-flex items-center gap-1 text-xs text-[#64748b] hover:text-[#112237] font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-[#112237]">
              {activeCompany
                ? `Productos de ${activeCompany.name}`
                : "Mis Productos"}
            </h1>
            <p className="text-xs text-[#64748b] flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5 text-[#f25c05]" />
              {activeCompany
                ? `Catálogo oficial de ${activeCompany.name}`
                : "Gestión de catálogo como vendedor independiente"}
            </p>
          </div>

          <Link href="/products/new?from=dashboard">
            <button className="flex items-center gap-2 bg-[#f25c05] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#d94d04] transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              Nuevo producto
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 space-y-4 shadow-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-[#f1f5f9] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Skeleton width={56} height={56} borderRadius={12} />
                  <div className="space-y-1.5">
                    <Skeleton width={200} height={16} />
                    <Skeleton width={90} height={12} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton width={70} height={24} borderRadius={12} />
                  <Skeleton width={80} height={32} borderRadius={8} />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-[#f1f5f9] text-xs font-bold uppercase tracking-wider text-[#64748b] bg-[#f8fafc]">
              <div className="col-span-4">Producto</div>
              <div className="col-span-2">Precio</div>
              <div className="col-span-2">Stock</div>
              <div className="col-span-2">Estado</div>
              <div className="col-span-2 text-right">Acciones</div>
            </div>

            <div className="divide-y divide-[#f1f5f9]">
              {products.map((product) => {
                const mainImage = product.images?.[0]?.url;
                const productStock = product.stock ?? 1;

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-[#f8fafc]/80 transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-[#f8fafc] rounded-xl overflow-hidden shrink-0 border border-[#e2e8f0] flex items-center justify-center">
                        {mainImage ? (
                          <>
                            <Image
                              src={mainImage}
                              alt={product.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                              unoptimized
                            />
                            {product.imageCount > 1 && (
                              <div className="absolute bottom-1 right-1 bg-[#f25c05] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md shadow-sm">
                                +{product.imageCount - 1}
                              </div>
                            )}
                          </>
                        ) : (
                          <Package className="w-6 h-6 text-[#cbd5e1]" />
                        )}
                      </div>
                      <div className="min-w-0">
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          productStock > 5
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : productStock > 0
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        <Package className="w-3.5 h-3.5" />
                        {productStock > 0 ? `${productStock} un.` : "Sin Stock"}
                      </span>
                    </div>

                    <div className="col-span-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          product.status === "active" && productStock > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : product.status === "sold" || productStock <= 0
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {product.status === "active" && productStock > 0
                          ? "Activo"
                          : productStock <= 0 || product.status === "sold"
                            ? "Agotado"
                            : "Inactivo"}
                      </span>
                    </div>

                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#64748b] hover:text-[#112237] hover:bg-white border border-transparent hover:border-[#e2e8f0] rounded-lg transition-all shadow-none hover:shadow-sm"
                        title="Editar producto"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Editar
                      </Link>
                      <Link
                        href={`/products/${product.id}`}
                        target="_blank"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#f25c05] hover:bg-[#f25c05]/10 rounded-lg transition-all"
                        title="Ver publicación"
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
              href="/products/new?from=dashboard"
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
