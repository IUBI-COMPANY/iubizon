import React from "react";

export const DiagramSection: React.FC = () => {
  return (
    <section className="w-full bg-transparent py-16">
      {/* Imagen del diagrama - Responsive */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Imagen Mobile - Solo visible en mobile */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/productos/bundle/diagrama-mobile.png"
          alt="Diagrama del Bundle Interactivo"
          className="w-full h-auto object-contain block md:hidden"
        />

        {/* Imagen Tablet - Solo visible en tablet */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/productos/bundle/diagrama-tablet.png"
          alt="Diagrama del Bundle Interactivo"
          className="w-full h-auto object-contain hidden md:block lg:hidden"
        />

        {/* Imagen Desktop - Solo visible en desktop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/productos/bundle/diagrama.png"
          alt="Diagrama del Bundle Interactivo"
          className="w-full h-auto object-contain hidden lg:block"
        />
      </div>
    </section>
  );
};
