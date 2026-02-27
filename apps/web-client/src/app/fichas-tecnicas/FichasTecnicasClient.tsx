"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TechnicalDocument {
  id: string;
  title: string;
  description: string;
  image: string;
  pdfUrl: string;
  category: string;
}

export const technicalDocuments: TechnicalDocument[] = [
  {
    id: "proyector-epson-109w",
    title: "Proyector Epson 109W",
    description:
      "Especificaciones técnicas completas del proyector Epson EB-109W. Incluye resolución, brillo, conectividad y más.",
    image: "/productos/bundle/upside109W.png",
    pdfUrl: "/productos/109W/Proyector_Epson_PowerLite_109W_Ficha_Tecnica.pdf",
    category: "Proyector",
  },
  {
    id: "touch-interactivo",
    title: "Touch Tank Hub 2",
    description:
      "Ficha técnica del sistema Touch Interactivo. Tecnología láser, compatibilidad y características de instalación.",
    image: "/productos/bundle/touch1.png",
    pdfUrl: "/productos/touch-hub-tank/Ficha_Tecnica_Touch_Tank_Hub2.pdf",
    category: "Modulo Interactivo",
  },
  {
    id: "adaptador-inalambrico-wifi",
    title: "Adaptador Inalámbrico Wifi",
    description:
      "Especificaciones del adaptador inalámbrico. Compatibilidad, conectividad WiFi y sistema Android.",
    image: "/productos/bundle/adaptador-wifi1.png",
    pdfUrl:
      "/productos/adaptador-wifi/Modulo_Conexion_Inalambrica_Ficha_Tecnica.pdf",
    category: "Accesorio",
  },
];

export const FichasTecnicasClient: React.FC = () => {
  const handleDownload = (pdfUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060e1e] via-black to-[#0a1428] py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/">
          <Button variant="secondary" size="md" styleVariant="solid">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-4">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-semibold">
            Documentación Técnica
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 font-sfpro">
          Fichas Técnicas
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto font-sfpro">
          Consulta las especificaciones detalladas de cada componente del Bundle
          Interactivo
        </p>
      </div>

      {/* Technical Documents Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {technicalDocuments.map((doc) => (
          <div
            key={doc.id}
            className="group bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] rounded-3xl border-2 border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden hover:shadow-[0_0_40px_rgba(242,95,12,0.3)]"
          >
            {/* Image Preview */}
            <div className="relative h-64 bg-gradient-to-br from-black/50 to-transparent flex items-center justify-center p-8 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-primary/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <Image
                src={doc.image}
                alt={doc.title}
                width={300}
                height={300}
                className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(242,95,12,0.3)] group-hover:scale-110 transition-transform duration-500"
                priority
              />

              {/* Category Badge */}
              <div className="absolute top-4 right-4 px-3 py-1 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full">
                <span className="text-xs text-primary font-semibold">
                  {doc.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2 font-sfpro">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed font-sfpro">
                  {doc.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <a
                  href={doc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary/30 font-sfpro"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver PDF
                </a>
                <button
                  onClick={() => handleDownload(doc.pdfUrl, doc.title)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border-2 border-white/20 hover:border-primary/40 transition-all font-sfpro"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto mt-16 text-center">
        <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-sfpro">
            ¿Necesitas más información?
          </h2>
          <p className="text-gray-300 mb-6 font-sfpro">
            Nuestro equipo de expertos está disponible para resolver todas tus
            dudas sobre nuestros productos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button
                variant="primary"
                size="lg"
                styleVariant="solid"
                className="font-sfpro font-bold"
              >
                Ver Bundle Completo
              </Button>
            </Link>
            <Link
              href="https://wa.me/51972300301?text=Hola%20iubizon,%20necesito%20información%20sobre%20el%20Bundle%20Interactivo"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="secondary"
                size="lg"
                styleVariant="solid"
                className="font-sfpro font-semibold"
              >
                Contactar a un asesor
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
