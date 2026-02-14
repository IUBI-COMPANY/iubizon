import React from "react";
import Link from "next/link";

interface PriceSectionProps {
  totalPrice: number;
}

export const PriceSection: React.FC<PriceSectionProps> = ({ totalPrice }) => {
  return (
    <section className="w-full bg-transparent py-16">
      {/* CTA Section con Precio */}
      <div className="w-full max-w-6xl mx-auto px-4" id="price-section">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-[0_0_30px_rgba(242,95,12,0.2)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-5xl md:text-7xl font-sfpro font-black text-white">
                S/ {totalPrice.toFixed(2)}
              </span>
            </div>
            <p className="text-base md:text-lg text-primary font-sfpro font-semibold">
              Bundle completo: Proyector + Touch Interactivo + Adaptador
              Inalámbrico
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-8"></div>

          <h3 className="text-2xl md:text-4xl font-sfpro font-bold text-white mb-4 text-center">
            Transforma tu espacio ahora
          </h3>
          <p className="text-base md:text-lg text-gray-300 font-sfpro font-light mb-8 max-w-2xl mx-auto leading-relaxed text-center">
            No estás adquiriendo tecnología, estás invirtiendo en impacto.
            Brinda una experiencia dinámica donde las ideas no solo se ven, se
            tocan y se comparten.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-3xl text-white mb-2">✓</p>
              <p className="text-white font-sfpro font-semibold text-sm">
                Instalación incluida
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-3xl text-white mb-2">✓</p>
              <p className="text-white font-sfpro font-semibold text-sm">
                Garantía de 12 meses
              </p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-3xl text-white mb-2">✓</p>
              <p className="text-white font-sfpro font-semibold text-sm">
                Soporte técnico
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/productos/bundle-interactivo"
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-sfpro font-bold rounded-full transition-all shadow-[0_0_20px_rgba(242,95,12,0.4)] hover:shadow-[0_0_30px_rgba(242,95,12,0.6)] hover:scale-105 cursor-pointer text-center"
            >
              Consíguelo ahora
            </Link>
            <a
              href="/documents/ficha-tecnica.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-sfpro font-semibold rounded-full border-2 border-white/20 hover:border-primary/40 transition-all cursor-pointer text-center"
            >
              Ver ficha técnica
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
