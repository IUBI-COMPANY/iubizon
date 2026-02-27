"use client";
import React, { useState } from "react";
import { ScrollProgressBar } from "@/components/bundle-interactivo";
import {
  HeroSection,
  SpecsSection,
  TutorialSection,
  PriceSection,
  SeparateProductsSection,
  ComparisonSection,
  DemoSection,
  FAQSection,
} from "./sections";
import { products } from "@/data-list/products";
import { FaChalkboardTeacher } from "react-icons/fa";
import { PiTelevisionSimpleBold } from "react-icons/pi";
import { LuCode } from "react-icons/lu";
import { GiFlax } from "react-icons/gi";

const TransformSection: React.FC = () => (
  <section className="w-full py-12 px-4 md:px-0 flex flex-col items-center bg-linear-to-b from-[#0a1833] to-[#060e1e] text-white text-center rounded-2xl mb-8 shadow-lg">
    <h1 className="text-3xl md:text-5xl font-bold mb-10">
      Transforma tus espacios
      <br />
      en experiencias interactivas
    </h1>
    <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <div className="flex flex-col items-center">
        <PiTelevisionSimpleBold className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Transforma proyectores o TV en Touch
        </span>
      </div>
      <div className="flex flex-col items-center">
        <FaChalkboardTeacher className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Perfecto para salas universitarias y escolares
        </span>
      </div>
      <div className="flex flex-col items-center">
        <LuCode className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Compatible con todas tus plataformas favoritas
        </span>
      </div>
      <div className="flex flex-col items-center">
        <GiFlax className="text-6xl mb-4" />
        <span className="text-lg font-medium">
          Apoya el empredimiento Peruano
        </span>
      </div>
    </div>
  </section>
);

export default function BundleInteractivoPage() {
  const [audienceType, setAudienceType] = useState<"escuelas" | "empresas">(
    "escuelas",
  );
  // Proyector seleccionado (por defecto el primero)
  const selectedProjector = products.find((p) => (p.type = "Bundle"));
  // Calcular precio total del bundle dinámicamente
  return (
    <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white bg-[#060e1e] font-sfpro">
      <ScrollProgressBar />
      <main className="grow">
        <HeroSection />
        <TransformSection />
        <TutorialSection
          audienceType={audienceType}
          setAudienceType={setAudienceType}
        />
        <SpecsSection />
        <ComparisonSection />
        <PriceSection totalPrice={selectedProjector?.price || 0} />
        <SeparateProductsSection />
        <DemoSection />
        <FAQSection />
      </main>
    </div>
  );
}
