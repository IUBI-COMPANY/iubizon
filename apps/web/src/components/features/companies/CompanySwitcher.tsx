"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, ChevronDown, Plus, ShoppingBag } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { createClient } from "@/lib/supabase/client";

export const CompanySwitcher = () => {
  const { companies, activeCompany, setActiveCompanyId, isLoadingCompanies } =
    useCompany();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchPendingCount = useCallback(async () => {
    if (!activeCompany?.id) {
      setPendingCount(0);
      return;
    }
    try {
      const res = await fetch(
        `/api/company/pending-orders-count?company_id=${encodeURIComponent(
          activeCompany.id,
        )}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPendingCount(data.count || 0);
      }
    } catch (err) {
      console.error(
        "[CompanySwitcher] Error cargando conteo de ventas pendientes:",
        err,
      );
    }
  }, [activeCompany?.id]);

  useEffect(() => {
    fetchPendingCount();

    if (!activeCompany?.id) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-company-sales-${activeCompany.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_packages",
          filter: `company_id=eq.${activeCompany.id}`,
        },
        () => {
          fetchPendingCount();
        },
      )
      .subscribe();

    const interval = setInterval(fetchPendingCount, 20000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeCompany?.id, fetchPendingCount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoadingCompanies) {
    return (
      <div className="h-8 w-24 bg-white/10 rounded-xl animate-pulse hidden sm:block" />
    );
  }

  if (!activeCompany) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-white/15 transition-all max-w-[110px] sm:max-w-[180px] focus:outline-none focus:ring-2 focus:ring-[#f25c05] shrink-0 relative cursor-pointer"
        title={`Empresa Activa: ${activeCompany.name}`}
      >
        <div className="relative w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#f25c05] border border-white/30 text-white flex items-center justify-center shrink-0 overflow-hidden text-[10px] sm:text-xs font-bold shadow-sm">
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
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              )}
            </span>
          )}
        </div>
        <span className="truncate max-w-[45px] sm:max-w-[95px]">
          {activeCompany.name}
        </span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* BADGE DE VENTAS NUEVAS RECIBIDAS (REAL-TIME) */}
      {pendingCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 bg-[#f25c05] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#112237] shadow-md z-20 pointer-events-none animate-in zoom-in-75"
          title={`${pendingCount} nueva(s) venta(s) recibida(s)`}
        >
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-2 z-50 text-[#112237]">
          {/* Header */}
          <div className="px-4 py-2 border-b border-[#f1f5f9] flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full bg-[#f25c05] text-white flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold shadow-sm">
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
                    <Building2 className="w-4 h-4 text-white" />
                  )}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">
                Empresa Seleccionada
              </p>
              <p className="font-bold text-sm text-[#112237] truncate mt-0.5">
                {activeCompany.name}
              </p>
              {activeCompany.tax_id && (
                <p className="text-[11px] text-[#94a3b8] truncate">
                  {activeCompany.tax_id}
                </p>
              )}
            </div>
          </div>

          {/* Switcher list if user belongs to multiple companies */}
          {companies.length > 1 && (
            <div className="py-1 border-b border-[#f1f5f9]">
              <p className="px-4 py-1 text-[10px] font-semibold text-[#94a3b8] uppercase">
                Cambiar de Empresa
              </p>
              {companies.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => {
                    setActiveCompanyId(comp.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-[#f8fafc] transition-colors ${
                    comp.id === activeCompany.id
                      ? "font-bold text-[#f25c05] bg-orange-50/50"
                      : "text-[#334155]"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="relative w-5 h-5 rounded-full bg-[#112237] text-white flex items-center justify-center shrink-0 overflow-hidden text-[10px] font-bold">
                      {comp.logo_url ? (
                        <Image
                          src={comp.logo_url}
                          alt={comp.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span>{comp.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="truncate">{comp.name}</span>
                  </div>
                  {comp.id === activeCompany.id && (
                    <span className="text-[10px] bg-[#f25c05] text-white px-1.5 py-0.5 rounded-full">
                      Activa
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="py-1">
            <Link
              href={`/user/dashboard?view=company&company_id=${activeCompany.id}`}
              className="flex items-center justify-between px-4 py-2 text-[#f25c05] font-bold hover:bg-orange-50/60 text-xs transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-[#f25c05]" />
                <span>Panel de {activeCompany.name}</span>
              </div>
              {pendingCount > 0 && (
                <span className="bg-[#f25c05] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  {pendingCount}
                </span>
              )}
            </Link>
            <Link
              href="/user/companies/new"
              className="flex items-center gap-3 px-4 py-2 text-[#334155] hover:bg-[#f8fafc] text-xs font-medium border-t border-[#f1f5f9] mt-1 pt-1.5 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="w-4 h-4 text-[#64748b]" />
              Registrar otra Empresa
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
