import React from "react";
import { Metadata } from "next";
import { FichasTecnicasClient } from "./FichasTecnicasClient";

export const metadata: Metadata = {
  title: "Fichas Técnicas - Bundle Interactivo | iubizon",
  description:
    "Consulta las fichas técnicas del Proyector Epson 109W, Touch Interactivo y Adaptador Inalámbrico MiraCast.",
  keywords: [
    "ficha técnica",
    "especificaciones",
    "proyector epson",
    "touch interactivo",
    "miracast",
    "bundle interactivo",
    "iubizon",
  ],
  openGraph: {
    title: "Fichas Técnicas - Bundle Interactivo | iubizon",
    description:
      "Consulta las fichas técnicas del Proyector Epson 109W, Touch Interactivo y Adaptador Inalámbrico MiraCast.",
    type: "website",
    url: "https://www.iubizon.com/fichas-tecnicas",
    siteName: "iubizon",
    locale: "es_PE",
  },
};

export default function FichasTecnicasPage() {
  return <FichasTecnicasClient />;
}
