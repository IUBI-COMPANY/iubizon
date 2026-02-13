import React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const SeparateProductsSection: React.FC = () => {
  const products = [
    {
      id: "touch",
      name: "Touch Interactivo",
      description:
        "Convierte cualquier superficie en una pantalla táctil interactiva",
      image: "/productos/bundle/touch1.png",
      price: 200,
      features: ["Puntos de calibración", "Tecnología láser", "Plug & Play"],
    },
    {
      id: "miracast",
      name: "Adaptador Inalámbrico",
      description:
        "Transmite contenido de forma inalámbrica desde cualquier dispositivo",
      image: "/productos/bundle/miracast1.png",
      price: 150,
      features: ["WiFi integrado", "Android", "Proyección inalámbrica"],
    },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-[#060e1e] to-black py-12 relative overflow-hidden">
      {/* Gradient decorativo */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título de la sección */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-sfpro font-bold text-white mb-4 tracking-tight">
            ¿Ya cuentas con proyector?
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 font-sfpro font-light max-w-3xl mx-auto">
            Pídelos por separado y mejora tu equipo actual
          </p>
        </div>

        {/* Grid de productos */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(242,95,12,0.2)]"
              style={{
                animation: "fadeInUp 0.6s ease-out forwards",
                animationDelay: `${index * 0.2}s`,
                opacity: 0,
              }}
            >
              {/* Imagen del producto */}
              <div className="relative h-80 lg:h-96 bg-gradient-to-br from-black/50 to-transparent flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_50px_rgba(242,95,12,0.3)] group-hover:scale-105 transition-all duration-500"
                />
              </div>

              {/* Contenido */}
              <div className="p-6">
                <h3 className="text-2xl lg:text-3xl font-sfpro font-bold text-white mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-400 font-sfpro font-light mb-4">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-1.5 mb-4">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      <span className="text-sm text-gray-300 font-sfpro">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Precio y CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-sm text-gray-400 font-sfpro mb-1">
                      Precio individual
                    </p>
                    <p className="text-3xl font-sfpro font-black text-white">
                      S/ {product.price}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/51972300301?text=Hola%20iubizon,%20quiero%20el%20${encodeURIComponent(product.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-sfpro font-semibold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(242,95,12,0.3)]"
                  >
                    Pedir
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA adicional */}
        <div className="text-center">
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

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};
