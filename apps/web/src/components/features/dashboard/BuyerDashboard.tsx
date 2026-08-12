"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Heart, Loader2, MapPin, Package, Plus, ShoppingBag, User as UserIcon } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import type { User } from "@/types";

interface BuyerDashboardProps {
  user: User;
  stats: {
    totalPurchases: number;
    pendingDeliveries: number;
    favoritesCount: number;
  };
}

interface PackageItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  subtotal: number;
  image: string | null;
}

interface TrackingPackage {
  packageKey: string;
  trackingNumber: string | null;
  carrierName: string | null;
  trackingUrl: string | null;
  estimatedDelivery: string | null;
  status: string;
  sellerName: string;
  orderIds: string[];
  items: PackageItem[];
}

interface BuyerOrderSession {
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  status: string;
  packagesCount: number;
  packages: TrackingPackage[];
}

function formatMoney(value: number | string | undefined | null): string {
  const num = typeof value === "number" ? value : Number(value || 0);
  return (isNaN(num) ? 0 : num).toFixed(2);
}

function formatFullDate(isoString: string) {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return isoString;
  }
}

export const BuyerDashboard = ({ user, stats }: BuyerDashboardProps) => {
  const { companies } = useCompany();
  const hasNoCompanies = companies.length === 0;

  const [recentSessions, setRecentSessions] = useState<BuyerOrderSession[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        setLoadingOrders(true);
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        if (res.ok && Array.isArray(data.sessions)) {
          setRecentSessions(data.sessions.slice(0, 3));
        }
      } catch (err) {
        console.error("Error al cargar compras recientes:", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchRecentOrders();
  }, []);

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

      {/* Banner de Invitación a Vender (Solo visible para usuarios nuevos sin empresas) */}
      {hasNoCompanies && (
        <div className="bg-gradient-to-r from-[#112237] to-[#1e3a5f] rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl shrink-0 border border-white/10">
              <Building2 className="w-8 h-8 text-[#f25c05]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white mb-1">
                ¿Deseas vender tus productos en iubizon?
              </h3>
              <p className="text-xs text-slate-300">
                Crea tu perfil de empresa con RUC 20, RUC 10 o DNI y accede al
                panel de ventas, catálogo y colaboradores.
              </p>
            </div>
          </div>
          <Link
            href="/products/new"
            className="bg-[#f25c05] hover:bg-[#d94d04] text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shrink-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear perfil de vendedor
          </Link>
        </div>
      )}

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

      {/* Sección de Compras Recientes (Minimalista) */}
      <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#112237]">
              Compras recientes
            </h2>
            <p className="text-xs text-[#64748b] mt-0.5">
              Últimas compras realizadas en iubizon
            </p>
          </div>
          <Link
            href="/user/orders"
            className="text-xs font-semibold text-[#f25c05] hover:underline"
          >
            Ver historial completo
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#f25c05] mx-auto mb-2" />
            <p className="text-xs text-[#64748b]">
              Cargando compras recientes...
            </p>
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="divide-y divide-[#f1f5f9]">
            {recentSessions.slice(0, 3).map((session) => {
              const firstItem = session.packages[0]?.items[0];
              const totalItemsCount = session.packages.reduce(
                (sum, p) =>
                  sum + p.items.reduce((s, i) => s + (i.quantity || 1), 0),
                0,
              );

              const isDelivered =
                session.status === "delivered" ||
                session.status === "completed";
              const isShipped =
                session.status === "shipped" || session.status === "in_transit";

              const badgeStyle = isDelivered
                ? "bg-emerald-100 text-emerald-800"
                : isShipped
                  ? "bg-blue-100 text-blue-800"
                  : "bg-amber-100 text-amber-800";

              const badgeLabel = isDelivered
                ? "Entregado"
                : isShipped
                  ? "En camino"
                  : "Pendiente";

              return (
                <Link
                  key={session.orderCode}
                  href={`/user/orders/${session.orderCode}`}
                  className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0 hover:bg-slate-50/60 -mx-6 px-6 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl overflow-hidden relative shrink-0 border border-slate-200">
                      {firstItem?.image ? (
                        <Image
                          src={firstItem.image}
                          alt={firstItem.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#112237] group-hover:text-[#f25c05] transition-colors">
                          ORDEN #{session.orderCode}
                        </span>
                        <span className="text-[11px] font-semibold text-[#64748b]">
                          ({totalItemsCount}{" "}
                          {totalItemsCount === 1 ? "producto" : "productos"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs font-extrabold text-[#f25c05]">
                          S/ {formatMoney(session.totalAmount)}
                        </p>
                        {session.createdAt && (
                          <span className="text-[11px] text-[#64748b]">
                            • {formatFullDate(session.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${badgeStyle}`}
                  >
                    {badgeLabel}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#112237]">
              Aún no has realizado compras
            </p>
            <p className="text-[11px] text-[#64748b] mt-0.5">
              Explora el catálogo y realiza tu primera compra contra entrega.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
