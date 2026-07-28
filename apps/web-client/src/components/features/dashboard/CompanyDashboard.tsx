"use client";

import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Eye,
  Heart,
  Loader2,
  Package,
  Plus,
  ShoppingCart,
  Users,
} from "lucide-react";
import type { Company } from "@/types";

interface CompanyDashboardProps {
  activeCompany: Company;
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    favoritesCount: number;
    totalViews: number;
  };
  recentProducts: Array<{
    id: string;
    title: string;
    price: number;
    status: string;
    views: number;
    image: string | null;
    created_at: string;
  }>;
  loading: boolean;
}

export const CompanyDashboard = ({
  activeCompany,
  stats,
  recentProducts,
  loading,
}: CompanyDashboardProps) => {
  return (
    <div className="space-y-8">
      {/* Cabecera Comercial de la Empresa */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-full bg-[#f25c05] border-2 border-white text-white flex items-center justify-center shrink-0 overflow-hidden text-base font-bold shadow-md">
            {activeCompany.logo_url ? (
              <Image
                src={activeCompany.logo_url}
                alt={activeCompany.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span>
                {activeCompany.name?.[0]?.toUpperCase() || (
                  <Building2 className="w-6 h-6" />
                )}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#112237]">
                Dashboard de {activeCompany.name}
              </h1>
              <span className="text-[10px] bg-[#f25c05] text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Empresa
              </span>
            </div>
            <p className="text-xs text-[#64748b] mt-0.5">
              {activeCompany.tax_id || "Empresa / Marca Registrada"} • Panel de
              Gestión Comercial & Catálogo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <Link
            href={`/companies/${activeCompany.slug || activeCompany.id}`}
            target="_blank"
            className="flex items-center justify-center gap-1.5 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] font-semibold px-3.5 py-2.5 rounded-xl transition-all text-xs shadow-sm flex-1 sm:flex-initial"
          >
            <Building2 className="w-4 h-4 text-[#f25c05]" />
            Ver perfil de empresa
          </Link>
          <Link
            href={`/user/companies/${activeCompany.id}/members`}
            className="flex items-center justify-center gap-1.5 bg-white hover:bg-[#f8fafc] text-[#334155] border border-[#e2e8f0] font-semibold px-3.5 py-2.5 rounded-xl transition-all text-xs shadow-sm flex-1 sm:flex-initial"
          >
            <Users className="w-4 h-4 text-[#112237]" />
            Equipo
          </Link>
        </div>
      </div>

      {/* Indicadores Comerciales (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/user/dashboard/products"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#f25c05]/10 rounded-xl group-hover:bg-[#f25c05] group-hover:text-white transition-colors">
              <Package className="w-5 h-5 text-[#f25c05] group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider group-hover:text-[#f25c05] transition-colors">
              Productos
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112237]">
            {stats.totalProducts}
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {stats.activeProducts} activos en tienda
          </p>
        </Link>

        <Link
          href="/user/dashboard/orders"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <ShoppingCart className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider group-hover:text-blue-500 transition-colors">
              Ventas / Pedidos
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112237]">
            {stats.totalOrders}
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {stats.pendingOrders} por despachar
          </p>
        </Link>

        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <Eye className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Alcance de Marca
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112237]">
            {stats.totalViews}
          </p>
          <p className="text-xs text-[#64748b] mt-1">vistas de publicaciones</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rose-500/10 rounded-xl">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Favoritos
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112237]">
            {stats.favoritesCount}
          </p>
          <p className="text-xs text-[#64748b] mt-1">interacciones recibidas</p>
        </div>
      </div>

      {/* Publicaciones Recientes de la Empresa */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#f1f5f9] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#112237] text-base">
              Publicaciones recientes
            </h2>
            <p className="text-xs text-[#64748b]">
              Últimos productos publicados para {activeCompany.name}
            </p>
          </div>
          <Link
            href="/user/dashboard/products"
            className="text-xs font-semibold text-[#f25c05] hover:underline"
          >
            Ver catálogo completo
          </Link>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <Skeleton width={48} height={48} borderRadius={12} />
                  <div className="space-y-1.5">
                    <Skeleton width={180} height={14} />
                    <Skeleton width={80} height={12} />
                  </div>
                </div>
                <Skeleton width={60} height={24} borderRadius={12} />
              </div>
            ))}
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="divide-y divide-[#f1f5f9]">
            {recentProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/edit/${product.id}`}
                className="flex items-center justify-between p-4 hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] overflow-hidden shrink-0 flex items-center justify-center">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Package className="w-5 h-5 text-[#cbd5e1]" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#112237] line-clamp-1">
                      {product.title}
                    </p>
                    <p className="text-xs font-bold text-[#f25c05]">
                      S/ {product.price.toFixed(2)}
                    </p>
                  </div>
                </div>

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
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-[#64748b]">
            <Package className="w-10 h-10 text-[#cbd5e1] mx-auto mb-3" />
            <p className="font-semibold text-sm text-[#112237]">
              No hay productos publicados en esta empresa
            </p>
            <p className="text-xs text-[#94a3b8] mt-1 mb-4">
              Comienza a publicar catálogo oficial para {activeCompany.name}
            </p>
            <Link
              href="/products/new?from=dashboard"
              className="inline-flex items-center gap-1.5 bg-[#f25c05] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#d94d04] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Publicar primer producto
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
