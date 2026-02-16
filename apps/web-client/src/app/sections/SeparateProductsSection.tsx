import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const SeparateProductsSection: React.FC = () => {
  return (
    <section className="w-full bg-gradient-to-b from-[#060e1e] to-black py-12 relative overflow-hidden">
      {/* Gradient decorativo */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-semibold">
              Ya tienes proyector
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-sfpro font-bold text-white mb-4 tracking-tight">
            Consigue tus accesorios aparte
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 font-sfpro font-light max-w-3xl mx-auto">
            Touch + Adaptador Inalámbrico en dúo perfecto
          </p>
        </div>

        {/* Card de accesorios en dúo */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm border-2 border-primary/30 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_60px_rgba(242,95,12,0.3)]">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              {/* Touch Interactivo */}
              <div className="text-center space-y-4">
                <div className="relative h-64 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"></div>
                  <Image
                    src="/productos/bundle/touch1.png"
                    alt="Touch Interactivo"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(242,95,12,0.4)] hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl md:text-3xl font-sfpro font-bold text-white">
                  Touch Interactivo
                </h3>
                <p className="text-gray-400 font-sfpro font-light">
                  Convierte cualquier superficie en táctil
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-sm text-gray-300">
                      Tecnología láser
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                    <span className="text-sm text-gray-300">Plug & Play</span>
                  </div>
                </div>
              </div>

              {/* Adaptador Inalámbrico */}
              <div className="text-center space-y-4">
                <div className="relative h-64 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-radial from-purple-500/20 via-transparent to-transparent"></div>
                  <Image
                    src="/productos/bundle/miracast1.png"
                    alt="Adaptador Inalámbrico"
                    width={400}
                    height={400}
                    className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-2xl md:text-3xl font-sfpro font-bold text-white">
                  Adaptador Inalámbrico
                </h3>
                <p className="text-gray-400 font-sfpro font-light">
                  Proyección sin cables desde cualquier dispositivo
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-300">
                      WiFi integrado
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-gray-300">
                      Sistema Android
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador con precio */}
            <div className="border-t-2 border-primary/20"></div>

            {/* Footer con precio y CTA */}
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="text-center md:text-left">
                <p className="text-sm text-gray-400 font-sfpro mb-1">
                  Dúo de accesorios
                </p>
                <p className="text-4xl md:text-5xl font-sfpro font-black text-white">
                  S/ 2000
                </p>
                <p className="text-sm text-gray-500 mt-1">Touch + Adaptador</p>
              </div>

              <Link
                href="/productos/accesorios-duo"
                className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-sfpro font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(242,95,12,0.4)]"
              >
                Conseguir dúo
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* CTA adicional */}
        <div className="text-center mt-12">
          <p className="text-gray-400 font-sfpro font-light mb-6">
            ¿Necesitas ayuda para elegir? Contáctanos y te asesoramos
          </p>
          <a
            href="https://wa.me/51972300301?text=Hola%20iubizon,%20necesito%20asesoría"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-sfpro font-semibold rounded-full border-2 border-white/20 hover:border-primary/40 transition-all"
          >
            Hablar con un asesor
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
