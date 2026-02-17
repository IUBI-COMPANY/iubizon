"use client";

import React from "react";
import {
  Presentation,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

type BenefitCard = {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
};

const benefits: BenefitCard[] = [
  {
    title: "Equipamiento para múltiples salas",
    description:
      "Proyectores y soluciones ideales para instituciones educativas y empresas con varias aulas o salas de capacitación.",
    icon: Presentation,
    color: "from-blue-600 to-blue-800",
  },
  {
    title: "Planes corporativos personalizados",
    description:
      "Mantenimiento preventivo y atención prioritaria diseñada para empresas y organizaciones con alta demanda.",
    icon: Building2,
    color: "from-indigo-600 to-indigo-800",
  },
  {
    title: "Soporte para eventos y capacitaciones",
    description:
      "Reparación express y disponibilidad inmediata para conferencias, seminarios y presentaciones corporativas.",
    icon: BriefcaseBusiness,
    color: "from-amber-600 to-amber-800",
  },
  {
    title: "Protocolos y reportes profesionales",
    description:
      "Documentación técnica detallada, reportes de servicio y coordinación con áreas de TI o mantenimiento.",
    icon: ClipboardList,
    color: "from-purple-600 to-purple-800",
  },
  {
    title: "Garantía extendida para clientes corporativos",
    description:
      "Hasta 6 meses de garantía en reparaciones para organizaciones e instituciones con uso recurrente.",
    icon: ShieldCheck,
    color: "from-emerald-600 to-emerald-800",
  },
];

export default function AnimateCards() {
  return (
    <div className="w-full py-16 px-4 sm:px-6 lg:px-8">
      {/* Título integrado */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-4xl font-bold text-gray-900 tracking-tight">
          Servicios Especializados Para
          <span className="text-orange-600 block sm:inline">
            {" "}
            Empresas y Organizaciones
          </span>
        </h2>
        <p className="mt-5 text-lg text-gray-600 max-w-3xl mx-auto">
          Soluciones técnicas profesionales pensadas para instituciones
          educativas, empresas y organizaciones que requieren proyectores
          confiables y un servicio de calidad corporativa.
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {benefits.map((card, index) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-xl bg-white shadow-md border border-gray-200/60 group opacity-0 animate-fade-in-up hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            style={{
              animationDelay: `${index * 0.12}s`,
              animationFillMode: "forwards",
            }}
          >
            {/* Barra superior naranja corporativa */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500 group-hover:h-2.5" />

            <div className="p-7 pb-9 flex flex-col h-full">
              {/* Icono */}
              <div className="mb-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md transition-transform duration-400 group-hover:scale-105">
                  <card.icon className="h-7 w-7" strokeWidth={1.9} />
                </div>
              </div>

              {/* Contenido */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-700 transition-colors duration-300">
                {card.title}
              </h3>

              <p className="text-gray-600 leading-relaxed flex-grow text-[15px]">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
