"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SuccessRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderCode = searchParams.get("order_code");
    const query = orderCode
      ? `?order_code=${encodeURIComponent(orderCode)}`
      : "";
    router.replace(`/cart/result${query}`);
  }, [router, searchParams]);

  return null;
}

// Redirección de compatibilidad: /cart/success -> /cart/result
export default function CartSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessRedirect />
    </Suspense>
  );
}
