"use client";
import React from "react";
import { Calendar } from "lucide-react";
import { DemoStepsGroup } from "./demo/DemoStepsGroup";

export const DemoSection: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black via-[#060e1e] to-[#0a1428] relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 blur-[150px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div id="solicitar-demo" className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">
              Agenda tu demo
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            ¿Aun tienes dudas? Solicita una demostración gratis
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Regístrate y descubre cómo transformar tus presentaciones
          </p>
        </div>
        {/* Steps Form */}
        <DemoStepsGroup />
      </div>
    </section>
  );
};
