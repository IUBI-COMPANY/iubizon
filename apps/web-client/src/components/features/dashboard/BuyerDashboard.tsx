"use client";

import Link from "next/link";
import {
  Building2,
  Heart,
  MapPin,
  Plus,
  ShoppingBag,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@/types";

interface BuyerDashboardProps {
  user: User;
  stats: {
    totalPurchases: number;
    pendingDeliveries: number;
    favoritesCount: number;
  };
}

export const BuyerDashboard = ({ user, stats }: BuyerDashboardProps) => {
  return (
    <div className="space-y-8">
      {/* Cabecera del Comprador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#112237] text-white rounded-2xl shadow-sm">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#112237]">
              Mi Cuenta & Mis Compras
            </h1>
            <p className="text-xs text-[#64748b] mt-0.5">
              Bienvenido de nuevo,{" "}
              <span className="font-semibold text-[#112237]">
                {user.name || user.email}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Banner de Invitación a Vender */}
      <div className="bg-gradient-to-r from-[#112237] to-[#1e3a5f] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl shrink-0 border border-white/10">
            <Building2 className="w-8 h-8 text-[#f25c05]" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white mb-1">
              ¿Deseas vender tus productos o servicios en iubizon?
            </h3>
            <p className="text-xs text-slate-300">
              Crea tu perfil de empresa con RUC 20, RUC 10 o DNI y accede al
              panel de ventas, catálogo y colaboradores.
            </p>
          </div>
        </div>
        <Link
          href="/user/companies/new"
          className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Crear perfil de vendedor
        </Link>
      </div>

      {/* Indicadores para Compradores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/user/orders"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <ShoppingBag className="w-5 h-5 text-blue-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Mis Compras
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112237]">
            {stats.totalPurchases}
          </p>
          <p className="text-xs text-[#64748b] mt-1">
            {stats.pendingDeliveries > 0
              ? `${stats.pendingDeliveries} pedidos en camino`
              : "Historial de compras realizadas"}
          </p>
        </Link>

        <Link
          href="/favorites"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-rose-500/10 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Heart className="w-5 h-5 text-rose-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Lista de Deseos
            </span>
          </div>
          <p className="text-2xl font-bold text-[#112237]">
            {stats.favoritesCount}
          </p>
          <p className="text-xs text-[#64748b] mt-1">productos guardados</p>
        </Link>

        <Link
          href="/user/profile"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5 text-emerald-500 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
              Mi Perfil
            </span>
          </div>
          <p className="text-sm font-bold text-[#112237] mt-1 truncate">
            {user.email}
          </p>
          <p className="text-xs text-[#64748b] mt-1">Editar datos personales</p>
        </Link>
      </div>

      {/* Módulos de Acceso Rápido para Compradores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/user/orders"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-base text-[#112237] group-hover:text-[#f25c05] transition-colors mb-1">
              Seguimiento de Mis Compras
            </h3>
            <p className="text-xs text-[#64748b]">
              Revisa el estado de entrega y comprobantes de tus pedidos
            </p>
          </div>
          <ShoppingBag className="w-8 h-8 text-[#cbd5e1] group-hover:text-[#f25c05] transition-colors shrink-0" />
        </Link>

        <Link
          href="/favorites"
          className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-base text-[#112237] group-hover:text-[#f25c05] transition-colors mb-1">
              Mis Productos Favoritos
            </h3>
            <p className="text-xs text-[#64748b]">
              Accede a tus artículos guardados para comprar más tarde
            </p>
          </div>
          <Heart className="w-8 h-8 text-[#cbd5e1] group-hover:text-rose-500 transition-colors shrink-0" />
        </Link>
      </div>
    </div>
  );
};
