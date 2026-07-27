'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import type { Company } from '@/types';
import { useAuth } from '@/hooks/useAuth';

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  isLoadingCompanies: boolean;
  setActiveCompanyId: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  activeCompany: null,
  isLoadingCompanies: true,
  setActiveCompanyId: () => {},
  refreshCompanies: async () => {},
});

export const COMPANY_STORAGE_KEY = 'iubizon_active_company_id';

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const userId = user?.id;

  const fetchCompanies = useCallback(async () => {
    if (!userId) {
      setCompanies([]);
      setActiveCompany(null);
      setIsLoadingCompanies(false);
      return;
    }

    try {
      setIsLoadingCompanies(true);
      const res = await fetch('/api/companies');
      const data = await res.json();

      if (res.ok && Array.isArray(data.companies)) {
        const fetchedCompanies: Company[] = data.companies;
        setCompanies(fetchedCompanies);

        if (fetchedCompanies.length > 0) {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem(COMPANY_STORAGE_KEY) : null;
          const targetId = savedId || data.last_active_company_id;
          const found = fetchedCompanies.find((c) => c.id === targetId) || fetchedCompanies[0];

          setActiveCompany(found);
          if (typeof window !== 'undefined') {
            localStorage.setItem(COMPANY_STORAGE_KEY, found.id);
          }
        } else {
          setActiveCompany(null);
        }
      }
    } catch (err) {
      console.error('Error al cargar empresas en CompanyContext:', err);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSetActiveCompanyId = useCallback(
    async (companyId: string) => {
      const target = companies.find((c) => c.id === companyId);
      if (target) {
        setActiveCompany(target);
        if (typeof window !== "undefined") {
          localStorage.setItem(COMPANY_STORAGE_KEY, companyId);
        }
        try {
          await fetch("/api/companies", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyId }),
          });
        } catch (err) {
          console.error("Error al persistir empresa activa en BD:", err);
        } finally {
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }
      }
    },
    [companies],
  );

  const contextValue = useMemo(
    () => ({
      companies,
      activeCompany,
      isLoadingCompanies,
      setActiveCompanyId: handleSetActiveCompanyId,
      refreshCompanies: fetchCompanies,
    }),
    [companies, activeCompany, isLoadingCompanies, handleSetActiveCompanyId, fetchCompanies],
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
