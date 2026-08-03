"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, User as UserIcon } from "lucide-react";
import { Navbar } from "@/components/features/layout/Navbar";
import { Footer } from "@/components/features/layout/Footer";
import { BuyerDashboard } from "@/components/features/dashboard/BuyerDashboard";
import { CompanyDashboard } from "@/components/features/dashboard/CompanyDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/context/CompanyContext";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/context/ToastContext";

interface DashboardData {
  isCompanyMode: boolean;
  company: {
    id: string;
    name: string;
    tax_id: string | null;
    logo_url: string | null;
  } | null;
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    totalPurchases?: number;
    pendingDeliveries?: number;
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
}

function DashboardContent() {
  const { user, isLoading: authLoading } = useAuth();
  const { activeCompany, isLoadingCompanies } = useCompany();
  const { clearCart } = useCart();
  const toast = useToast();
  const searchParams = useSearchParams();

  const viewMode = searchParams.get("view"); // 'personal' | 'company' | null
  const paramCompanyId = searchParams.get("company_id");

  const isCompanyView =
    viewMode === "company" ||
    (viewMode !== "personal" && Boolean(activeCompany?.id));

  const targetCompanyId = isCompanyView
    ? activeCompany?.id || paramCompanyId
    : null;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const url = targetCompanyId
        ? `/api/user/dashboard?company_id=${targetCompanyId}`
        : `/api/user/dashboard`;

      const res = await fetch(url);
      const json = await res.json();

      if (res.ok) {
        setData(json);
      }
    } catch (err) {
      console.error("Error al cargar dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user, targetCompanyId]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, targetCompanyId, fetchDashboardData]);

  // Procesar confirmación de pago Niubiz al redirigir al Dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isSuccess = searchParams.get("success") === "true";
      const sessionCode = searchParams.get("sessionCode");

      if (isSuccess && sessionCode) {
        clearCart();
        localStorage.removeItem("iubizon_checkout_step");
        localStorage.removeItem("iubizon_checkout_form");
        toast.success(`¡Pago exitoso con tarjeta Niubiz! Orden #${sessionCode}`, "Pago Confirmado");
      }
    }
  }, [searchParams, clearCart, toast]);

  if (authLoading || isLoadingCompanies) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm max-w-md w-full">
          <UserIcon className="w-12 h-12 text-[#94a3b8] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#112237] mb-2">
            Inicia sesión
          </h2>
          <p className="text-sm text-[#64748b] mb-6">
            Para ingresar al panel de control de tu cuenta o empresa.
          </p>
          <Link
            href="/auth/login?redirect=/user/dashboard"
            className="inline-block bg-[#f25c05] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#d94d04] transition-all shadow-md w-full text-center"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    favoritesCount: 0,
    totalViews: 0,
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
      {isCompanyView && activeCompany ? (
        <CompanyDashboard
          activeCompany={activeCompany}
          stats={stats}
          recentProducts={data?.recentProducts || []}
          loading={loading}
        />
      ) : (
        <BuyerDashboard
          user={user}
          stats={{
            totalPurchases: stats.totalPurchases ?? 0,
            pendingDeliveries: stats.pendingDeliveries ?? 0,
            favoritesCount: stats.favoritesCount,
          }}
        />
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[#f25c05]" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  );
}