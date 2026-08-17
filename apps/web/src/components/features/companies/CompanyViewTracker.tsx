"use client";

import { useEffect, useRef } from "react";

interface CompanyViewTrackerProps {
  companyId: string;
}

export function CompanyViewTracker({ companyId }: CompanyViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!companyId || hasTrackedRef.current) return;

    hasTrackedRef.current = true;

    fetch(`/api/companies/${encodeURIComponent(companyId)}/view`, {
      method: "POST",
    }).catch((err) =>
      console.error(
        "[CompanyViewTracker] Error registrando vista de alcance:",
        err,
      ),
    );
  }, [companyId]);

  return null;
}
