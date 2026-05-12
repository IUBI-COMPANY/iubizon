import React from "react";
import type { Metadata } from "next";

import PageAnOrder from "@/app/productos/pedido/PageAnOrder";

export const metadata: Metadata = {
  title: "Productos a Pedido - iubizon | Tecnología en Perú",
  description:
    "Encuentra productos tecnológicos a pedido en iubizon. Proyectores, accesorios, equipos y más. Compra y venta de tecnología en Perú.",
  keywords: [
    "productos tecnológicos",
    "proyectores",
    "accesorios tecnológicos",
    "equipos tecnológicos",
    "compra tecnología perú",
    "iubizon",
    "Lima",
    "Perú",
  ],
  openGraph: {
    title: "Productos a Pedido - iubizon | Tecnología en Perú",
    description:
      "Encuentra productos tecnológicos a pedido en iubizon. Proyectores, accesorios y más en Perú.",
    url: "https://iubizon.com/productos/pedido",
    type: "website",
  },
};

// ==========================
// 🔹 Página principal (Server)
// ==========================
export default async function Page() {
  return <PageAnOrder />;
}
