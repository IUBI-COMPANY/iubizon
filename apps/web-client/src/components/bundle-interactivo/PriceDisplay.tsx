import React from "react";
import { Link } from "./Link";

interface PriceDisplayProps {
  total: number;
  tier: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ total }) => {
  return (
    <div className="w-full max-w-3xl mx-auto mt-20 p-10 bg-gradient-to-br from-[#1c4380]/20 to-[#060e1e] border border-primary/30 rounded-[3rem] shadow-2xl relative overflow-hidden text-center group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

      <span className="text-primary font-sfpro font-bold text-xs uppercase tracking-[0.5em] mb-4 block">
        Inversión Total del Bundle
      </span>

      <div className="flex flex-col items-center justify-center">
        <div className="flex items-start">
          <span className="text-primary text-3xl font-sfpro font-bold mt-4 mr-2">
            S/.
          </span>
          <span className="text-white text-7xl md:text-9xl font-sfpro font-black tracking-tighter tabular-nums transition-all duration-500">
            {total.toLocaleString()}
          </span>
          <span className="text-gray-500 text-xl font-sfpro font-bold mt-16 ml-2">
            SOLES
          </span>
        </div>
      </div>

      <p className="mt-10 text-gray-500 text-xs font-light italic font-sfpro">
        *Precio sugerido antes de impuestos. Incluye 1 año de garantía en todos
        los componentes y soporte técnico remoto.
      </p>

      <Link
        href="https://wa.me/51972300301?text=Hola%20iubizon%2C%20quiero%20el%20bundle%20interactivo"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-8 bg-primary hover:bg-white hover:text-primary text-white font-sfpro font-bold py-5 px-12 rounded-2xl transition-all duration-300 ease-out shadow-[0_10px_30px_rgba(242,95,12,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.15)] text-lg tracking-wide hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        CONSÍGUELO AHORA
      </Link>
    </div>
  );
};

export default PriceDisplay;
