import React from "react";
import { products } from "@/data-list/products";
import { ProductCard } from "@/components/ui/ProductCard";
import { productsCondition } from "@/data-list/productsCondition";
import Link from "next/link";
import BannerSlider from "@/components/ui/BannerSlider";

const BANNERS = [
  {
    src: "/images/slider1.png",
    alt: "Quieres distribuir productos Epson, nosotros te proveemos, tú los comercializas.",
  },
  {
    src: "/images/slider2.png",
    alt: "Tenemos los mejores productos Epson, la mejor calidad.",
  },
];

export default function Home() {
  const sortProductsBySpecial = (productsList: typeof products) => {
    return [...productsList].sort((a, b) => {
      // Priority 2: Special products
      if (a.campaign === b.campaign) return 0;
      return a.campaign ? -1 : 1;
    });
  };

  const productsByCondition = {
    "gama-alta": {
      ...productsCondition["gama-alta"],
      products: sortProductsBySpecial(
        products.filter((products) => products.gama === "alta"),
      ),
    },
    new: {
      ...productsCondition.new,
      products: sortProductsBySpecial(
        products.filter(
          (products) =>
            products.condition === "new" && products.gama !== "alta",
        ),
      ),
    },
    reconditioned: {
      ...productsCondition.reconditioned,
      products: sortProductsBySpecial(
        products.filter((products) => products.condition === "reconditioned"),
      ),
    },
  };

  return (
    <div className="min-h-screen h-auto w-full bg-slate-50">
      <BannerSlider banners={BANNERS} autoPlay autoPlayInterval={7000} />
      <main id="lista" className="mx-auto max-w-[1370px] px-6 py-10">
        {productsByCondition["gama-alta"].products.length > 0 && (
          <div className="!mt-6 !mb-[3em]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-primary">
                    {productsByCondition["gama-alta"].name}
                  </h2>
                </div>
                <p className="text-sm text-secondary/70 max-w-[60em]">
                  {productsByCondition["gama-alta"].description}
                </p>
                <p className="text-primary text-[.8em] mt-2 font-medium">
                  Llévate tu proyector de gama alta completamente nuevo y con
                  garantía.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {productsByCondition["gama-alta"].products.map(
                (product, index) => (
                  <ProductCard key={index} product={product} />
                ),
              )}
            </div>
          </div>
        )}

        {productsByCondition.new.products.length > 0 && (
          <div className="!mt-6 !mb-[3em]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-primary">
                    {productsByCondition.new.name}
                  </h2>
                </div>
                <p className="text-sm text-secondary/70 max-w-[60em]">
                  {productsByCondition.new.description}
                </p>
                <p className="text-primary text-[.8em] mt-2 font-medium">
                  Llévate tu proyector completamente nuevo y con garantía.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {productsByCondition.new.products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}
        {productsByCondition.reconditioned.products.length > 0 && (
          <div className="!mt-6 !mb-[3em]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-secondary">
                    {productsByCondition.reconditioned.name}
                  </h2>
                </div>
                <p className="text-sm text-secondary/70 max-w-[60em]">
                  {productsByCondition.reconditioned.description}
                </p>
                <p className="text-primary text-[.8em] mt-2 font-medium">
                  Equipos a precios más accesibles, totalmente funcionales y con
                  garantía
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {productsByCondition.reconditioned.products.map(
                (product, index) => (
                  <ProductCard key={index} product={product} />
                ),
              )}
            </div>
          </div>
        )}
        <section className="mt-8 mb-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary w-fit mx-auto mb-4">
              Servicio Especializado
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Servicio Técnico de Proyectores
            </h2>
            <p className="text-lg text-secondary/80 max-w-3xl mx-auto">
              Reparación y mantenimiento profesional para personas y
              organizaciones en Lima y todo Perú
            </p>
          </div>

          {/* Two Cards: Persona & Organización */}
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Card: Persona Natural */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-primary/30 group">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-b-2 border-primary/20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                    <svg
                      className="w-7 h-7 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-secondary">
                      Persona Natural
                    </h3>
                    <p className="text-sm text-secondary/70">
                      Servicio personalizado
                    </p>
                  </div>
                </div>
                <p className="text-secondary/80">
                  Atención personalizada para usuarios individuales, hogares y
                  pequeños proyectos
                </p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Diagnóstico gratuito
                      </p>
                      <p className="text-sm text-secondary/70">
                        Evaluación sin compromiso
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Servicio a domicilio
                      </p>
                      <p className="text-sm text-secondary/70">
                        Recogemos tu proyector en Lima
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Garantía de 6 meses
                      </p>
                      <p className="text-sm text-secondary/70">
                        En todas las reparaciones
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Repuestos originales
                      </p>
                      <p className="text-sm text-secondary/70">
                        Para todas las marcas
                      </p>
                    </div>
                  </li>
                </ul>

                <Link
                  href="/servicios/tecnico/persona"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all group-hover:scale-105"
                >
                  Solicitar Servicio
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Card: Organización */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-secondary/30 group">
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-6 border-b-2 border-secondary/20">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-secondary/15 rounded-full flex items-center justify-center group-hover:bg-secondary/25 transition-colors">
                    <svg
                      className="w-7 h-7 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-secondary">
                      Organización
                    </h3>
                    <p className="text-sm text-secondary/70">
                      Soluciones empresariales
                    </p>
                  </div>
                </div>
                <p className="text-secondary/80">
                  Para empresas, colegios, institutos, universidades, iglesias y
                  centros educativos
                </p>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Mantenimiento preventivo
                      </p>
                      <p className="text-sm text-secondary/70">
                        Contratos personalizados
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Atención prioritaria
                      </p>
                      <p className="text-sm text-secondary/70">
                        Soporte técnico dedicado 24/7
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Facturación electrónica
                      </p>
                      <p className="text-sm text-secondary/70">
                        Descuentos por volumen
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Servicio en sitio
                      </p>
                      <p className="text-sm text-secondary/70">
                        Técnicos en tu organización
                      </p>
                    </div>
                  </li>
                </ul>

                <Link
                  href="/servicios/tecnico/organizacion"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:bg-secondary/90 transition-all group-hover:scale-105"
                >
                  Solicitar Cotización
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-secondary/60 max-w-2xl mx-auto border-l-4 border-primary pl-4">
            <strong>Cobertura en Lima y todo Perú:</strong> Servicio de recojo y
            entrega de equipos. Consulta nuestras zonas de cobertura y tiempos
            de reparación.
          </p>
        </section>
      </main>
    </div>
  );
}
