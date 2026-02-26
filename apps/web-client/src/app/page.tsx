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
