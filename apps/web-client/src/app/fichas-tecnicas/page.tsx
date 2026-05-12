import React from "react";
import { Metadata } from "next";
import { FichasTecnicasClient } from "./FichasTecnicasClient";

export const metadata: Metadata = {
  title: "Fichas Técnicas - Productos Tecnológicos | iubizon",
  description:
    "Consulta las fichas técnicas de proyectores, accesorios y equipos tecnológicos disponibles en iubizon.",
  keywords: [
    "ficha técnica",
    "especificaciones técnicas",
    "proyectores",
    "accesorios tecnológicos",
    "equipos tecnológicos",
    "iubizon",
    "Perú",
  ],
  openGraph: {
    title: "Fichas Técnicas - Productos Tecnológicos | iubizon",
    description:
      "Consulta las fichas técnicas de proyectores, accesorios y equipos tecnológicos en Perú.",
    type: "website",
    url: "https://www.iubizon.com/fichas-tecnicas",
    siteName: "iubizon",
    locale: "es_PE",
  },
};

export default function FichasTecnicasPage() {
  return <FichasTecnicasClient />;
}
