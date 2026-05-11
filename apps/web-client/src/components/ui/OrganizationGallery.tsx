// @/components/ui/OrganizationGallery.tsx
"use client";

import Image from "next/image";
import { CheckCircle, Zap, Settings, TrendingUp } from "lucide-react";

const galleryItems = [
  {
    src: "/images/diagnosticoimg.webp",
    alt: "Proyector con filtro y ventiladores llenos de polvo antes del mantenimiento",
    caption:
      "Diagnostico de posibles problemas: Sobrecalentamiento y pérdida de brillo por polvo acumulado",
    icon: Zap,
    status: "Diagnóstico",
    color: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    src: "/images/reparacionimg.jpg",
    alt: "Proyector limpio, filtros nuevos y óptica calibrada",
    caption:
      "Reparación y Validacion: Rendimiento óptimo y vida útil prolongada",
    icon: CheckCircle,
    status: "Limpieza",
    color: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    src: "/images/instalacionimg.jpg",
    alt: "Proyector Epson montado en aula universitaria con proyección clara",
    caption: "Instalado y calibrado en entorno educativo",
    icon: Settings,
    status: "Calibración",
    color: "bg-orange-50",
    borderColor: "border-orange-100",
  },
  {
    src: "/images/resultadoimg.jpg",
    alt: "Proyector corporativo en sala de conferencias",
    caption: "Presentaciones profesionales sin interrupciones",
    icon: TrendingUp,
    status: "Resultado",
    color: "bg-orange-50",
    borderColor: "border-orange-100",
  },
];

export function OrganizationGallery() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      {/* Encabezado */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto">
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationFillMode: "forwards" }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">
            De Problema a<span className="text-orange-600"> Solución</span>{" "}
            Integral
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Cada proyector pasa por nuestro proceso completo de mantenimiento,
            asegurando óptimo rendimiento y máxima durabilidad.
          </p>
        </div>
      </div>

      {/* Galería */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-6 lg:gap-8">
        {galleryItems.map((item, i) => {
          const Icon = item.icon;

          return (
            <div
              key={i}
              className="group relative h-full flex flex-col opacity-0 animate-fade-in-up hover:-translate-y-2 transition-all duration-500"
              style={{
                animationDelay: `${(i + 1) * 0.15}s`,
                animationFillMode: "forwards",
              }}
            >
              {/* Tarjeta principal */}
              <div
                className={`
                flex flex-col h-full rounded-xl sm:rounded-2xl overflow-hidden
                bg-white border ${item.borderColor}
                shadow-lg shadow-gray-200/50 
                group-hover:shadow-xl group-hover:shadow-orange-100/50
                transition-all duration-500
              `}
              >
                {/* Encabezado con icono */}
                <div
                  className={`${item.color} px-4 sm:px-5 py-3 sm:py-4 border-b`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg`}>
                      <Icon className={`w-5 h-5`} />
                    </div>
                    <div>
                      <span className="text-xs font-{sf_pro} uppercase tracking-wider text-black">
                        Paso {i + 1}: {item.status}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-8 h-1 rounded-full bg-orange-300`}
                        ></div>
                        {i < galleryItems.length - 1 && (
                          <div className="w-4 h-1 rounded-full bg-gray-300"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contenedor de imagen con efecto */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* Overlay sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent z-10"></div>

                  <div className="relative w-full h-full">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={i < 2}
                    />
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="flex flex-col flex-grow p-4 sm:p-6">
                  <div className="mb-4">
                    <h3
                      className={`
                      text-base sm:text-lg font-bold mb-2 
                                        `}
                    >
                      {item.caption.split(":")[0] + ":"}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {item.caption.split(":")[1]?.trim() || item.caption}
                    </p>
                  </div>

                  {/* Indicador de progreso en naranja */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Estado del equipo</span>
                      <span className={`font-semibold text-orange-600`}>
                        {i === 0
                          ? "En diagnóstico"
                          : i === 1
                            ? "En limpieza"
                            : i === 2
                              ? "Calibrando"
                              : "Operativo"}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`
                          h-1.5 rounded-full bg-orange-500
                          ${
                            i === 0
                              ? `w-1/4`
                              : i === 1
                                ? `w-1/2`
                                : i === 2
                                  ? `w-3/4`
                                  : `w-full`
                          }
                          transition-all duration-1000
                        `}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Efecto de brillo naranja en hover */}
              <div
                className="
                absolute inset-0 rounded-2xl
                bg-gradient-to-r from-orange-400/0 via-orange-500/10 to-orange-400/0
                opacity-0 group-hover:opacity-100
                blur-xl
                transition-opacity duration-500
                -z-10
              "
              ></div>
            </div>
          );
        })}
      </div>

      {/* Indicador visual del proceso en naranja*/}
      <div
        className="hidden md:flex mt-8 lg:mt-12 justify-center opacity-0 animate-fade-in-up"
        style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
      >
        <div
          className="
    inline-flex items-center gap-3 px-6 py-3
    rounded-full border border-orange-200 bg-white
    text-sm font-medium text-gray-700 shadow-sm
  "
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Diagnóstico</span>
          </div>

          <div className="w-6 h-0.5 bg-orange-500 mx-2" />

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Limpieza</span>
          </div>

          <div className="w-6 h-0.5 bg-orange-300 mx-2" />

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-600" />
            <span>Calibración</span>
          </div>

          <div className="w-6 h-0.5 bg-orange-300 mx-2" />

          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-600" />
            <span>Resultado</span>
          </div>
        </div>
      </div>
    </div>
  );
}
