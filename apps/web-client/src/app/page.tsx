"use client";
import React, { useState, useMemo } from "react";
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
import { PROJECTORS, BASE_BUNDLE_PRICE } from "@/data-list/bundleProjectors";
export default function BundleInteractivoPage() {
  const [audienceType, setAudienceType] = useState<"escuelas" | "empresas">(
    "escuelas",
  );
  // Proyector seleccionado (por defecto el primero)
  const selectedProjector = PROJECTORS[0];
  // Calcular precio total del bundle dinámicamente
  const totalPrice = useMemo(
    () => selectedProjector.price + BASE_BUNDLE_PRICE,
    [selectedProjector],
  );
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
        <PriceSection totalPrice={totalPrice} />
        <SeparateProductsSection />
        <DemoSection />
        <FAQSection />
      </main>
    </div>
  );
}
