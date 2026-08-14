"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AuthBackButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [label, setLabel] = useState("Volver al Inicio");

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    const hasReferrer =
      typeof document !== "undefined" &&
      document.referrer &&
      document.referrer.includes(window.location.host) &&
      !document.referrer.includes("/auth/");

    if (redirect) {
      if (redirect === "/cart" || redirect.startsWith("/cart")) {
        setLabel("Volver al Carrito");
      } else {
        setLabel("Volver");
      }
    } else if (hasReferrer) {
      setLabel("Volver");
    } else {
      setLabel("Volver al Inicio");
    }
  }, [searchParams]);

  const handleClick = () => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
      return;
    }

    if (
      typeof document !== "undefined" &&
      document.referrer &&
      document.referrer.includes(window.location.host) &&
      !document.referrer.includes("/auth/")
    ) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 text-xs font-bold text-[#475569] hover:text-[#f25c05] bg-white border border-[#e2e8f0] px-3.5 py-2 rounded-2xl shadow-sm transition-all hover:shadow-md cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4 text-[#f25c05]" />
      <span>{label}</span>
    </button>
  );
}
