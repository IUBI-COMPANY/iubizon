import React from "react";
import type { Metadata } from "next";

import PageAnOrder from "@/app/productos/pedido/PageAnOrder";

export const metadata: Metadata = {
  title: "Productos a Pedido - Bundle Interactivo y Más | Iubizon Perú",
  description:
    "Soluciones educativas interactivas para empresas, colegios y organizaciones. Bundle Interactivo, Dúo Interactivo y equipos multimedia personalizados en Perú.",
  keywords: [
    "bundle interactivo organizaciones",
    "dúo interactivo empresas",
    "soluciones educativas empresas",
    "tecnología interactiva colegios",
    "aulas digitales instituciones",
    "equipos multimedia empresas",
    "proyectores empresariales",
    "touch interactivo organizaciones",
    "iubizon",
    "Lima",
    "Perú",
  ],
  openGraph: {
    title: "Productos a Pedido - Bundle Interactivo y Más | Iubizon Perú",
    description:
      "Soluciones educativas interactivas para empresas, colegios y organizaciones. Bundle Interactivo, Dúo Interactivo y equipos multimedia en Perú.",
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
