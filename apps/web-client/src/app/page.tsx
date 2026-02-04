import React from "react";
import { products } from "@/data-list/products";
import { ProductCard } from "@/components/ui/ProductCard";
import Image from "next/image";
import { productsCondition } from "@/data-list/productsCondition";
import Link from "next/link";
import { SlidersComponent } from "@/components/home/Sliders";

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

  const quantityProjectors = products
    .filter((product) => product.type === "Proyector")
    .reduce((acc, product) => {
      return acc + product.stock;
    }, 0);

  return (
    <div className="min-h-screen h-auto w-full bg-slate-50">
      <SlidersComponent />
      <main id="lista" className="mx-auto max-w-[1370px] px-6 py-10">
        <section className="mb-6 grid gap-3 text-center max-w-[70%] m-auto md:grid-cols-4">
          <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
            <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-secondary text-sm">
              Garantía Extendida
            </h3>
            <p className="text-[0.65rem] text-secondary/70 mt-0.5">
              Hasta 12 meses en equipos nuevos
            </p>
          </div>
          <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
            <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="font-bold text-secondary text-sm">
              Prueba en Local
            </h3>
            <p className="text-[0.65rem] text-secondary/70 mt-0.5">
              Verifica tu equipo antes de llevarlo
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
            <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-secondary text-sm">
              Descuentos x Lote
            </h3>
            <p className="text-[0.65rem] text-secondary/70 mt-0.5">
              Precios especiales desde 3 unidades
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 shadow-sm border border-slate-100">
            <div className="mx-auto w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-secondary text-sm">
              Entrega en Lima
            </h3>
            <p className="text-[0.65rem] text-secondary/70 mt-0.5">
              Envío disponible • Retiro en tienda
            </p>
          </div>
        </section>

        {/* Sección de Proceso de Compra */}
        <section className="mt-8 mb-6 rounded-xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-secondary">
              ¿Cómo Comprar tu Proyector?
            </h2>
            <p className="text-sm text-secondary/70 mt-2">
              Proceso simple y seguro en 4 pasos
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-3">
                1
              </div>
              <h3 className="font-bold text-secondary text-sm mb-1.5">
                Elige tu Modelo
              </h3>
              <p className="text-xs text-secondary/70">
                Revisa las especificaciones, stock y precio de cada proyector
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-3">
                2
              </div>
              <h3 className="font-bold text-secondary text-sm mb-1.5">
                Solicitud de compra
              </h3>
              <p className="text-xs text-secondary/70">
                Envíanos su solicitud de compra por WhatsApp o visita nuestro
                local
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-3">
                3
              </div>
              <h3 className="font-bold text-secondary text-sm mb-1.5">
                Verificación
              </h3>
              <p className="text-xs text-secondary/70">
                Prueba el equipo en nuestro local o coordina entrega
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-3">
                4
              </div>
              <h3 className="font-bold text-secondary text-sm mb-1.5">
                Recibe tu Equipo
              </h3>
              <p className="text-xs text-secondary/70">
                Con garantía, accesorios y soporte técnico incluido
              </p>
            </div>
          </div>
        </section>

        {productsByCondition["gama-alta"].products.length > 0 && (
          <div className="!mt-6 !mb-[3em]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-primary">
                    {productsByCondition["gama-alta"].name}
                  </h2>
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                    <span>🔥</span>
                    <span>17% DSCTO</span>
                  </span>
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
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
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-primary/80 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">
                    <span>🔥</span>
                    <span>17% DSCTO</span>
                  </span>
                </div>
                <p className="text-sm text-secondary/70 max-w-[60em]">
                  {productsByCondition.new.description}
                </p>
                <p className="text-primary text-[.8em] mt-2 font-medium">
                  Llévate tu proyector completamente nuevo y con garantía.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {productsByCondition.new.products.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        {quantityProjectors >= 3 && (
          <section className="mt-10 mb-[5em] md:mt-[10em] rounded-2xl p-6 text-center shadow-sm text-white  bg-gradient-to-br from-secondary/90 via-secondary to-secondary/90 relative">
            <Image
              src="/images/pet-corriendo-izquierda.png"
              alt="iubizon - Descuentos especiales en proyectores Epson para empresas y educación"
              width={500}
              height={500}
              className="relative lg:absolute top-[1em] lg:top-[-8em] right-[1em] lg:right-[4em] w-[23em] mx-auto"
            />
            <h3 className="text-xl font-bold">
              🔥 Oferta por compra por lotes
            </h3>
            <p className="mt-1 opaproducty-90">
              Entre proyectores mixtos o del mismo modelo
            </p>
            <p className="mt-2 text-2xl font-extrabold text-primary">
              A UN PRECIO ESPECIAL
            </p>
            <p className="text-sm opacity-95">
              Prueba de funcionamiento • Con garantía
            </p>
            <a
              href="https://wa.me/51972300301?text=Hola%20iubizon,%20quiero%20un%20lote%20de%20"
              target="_blank"
              className="mt-4 inline-flex rounded-full px-10 py-3 text-sm font-semibold shadow bg-primary"
            >
              Reservar ahora
            </a>
          </section>
        )}
        {productsByCondition.reconditioned.products.length > 0 && (
          <div className="!mt-6 !mb-[3em]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-secondary">
                    {productsByCondition.reconditioned.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md animate-pulse">
                    <span>💥</span>
                    <span>42% DSCTO</span>
                  </span>
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {productsByCondition.reconditioned.products.map(
                (product, index) => (
                  <ProductCard key={index} product={product} />
                ),
              )}
            </div>
          </div>
        )}
        {/* Sección de Preguntas Frecuentes */}
        <section className="mt-8 mb-6 rounded-xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm border border-slate-100">
          <div className="text-center mb-5">
            <h2 className="text-2xl font-bold text-secondary">
              Preguntas Frecuentes
            </h2>
            <p className="text-sm text-secondary/70 mt-2">
              Resuelve tus dudas antes de comprar
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-secondary mb-2 flex items-start gap-2">
                <span className="text-primary">❓</span>
                ¿Los equipos de Exhibición / Reacondicionado son confiables?
              </h3>
              <p className="text-sm text-secondary/70 pl-6">
                Sí, todos pasan por limpieza profunda, reemplazo de componentes
                dañados y pruebas exhaustivas. Incluyen 6 meses de garantía.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-secondary mb-2 flex items-start gap-2">
                <span className="text-primary">❓</span>
                ¿Hacen envíos a provincia?
              </h3>
              <p className="text-sm text-secondary/70 pl-6">
                Sí, coordinamos envíos a todo el Perú. El costo y tiempo depende
                de tu ubicación. Contáctanos para más detalles.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-secondary mb-2 flex items-start gap-2">
                <span className="text-primary">❓</span>
                ¿Incluyen accesorios?
              </h3>
              <p className="text-sm text-secondary/70 pl-6">
                Todos los proyectores incluyen cable de poder, cable HDMI y
                control remoto. Los soportes se venden por separado.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-secondary mb-2 flex items-start gap-2">
                <span className="text-primary">❓</span>
                ¿Ofrecen soporte post-venta?
              </h3>
              <p className="text-sm text-secondary/70 pl-6">
                Sí, brindamos asesoría técnica, instalación y servicio de
                mantenimiento. Nuestro equipo te ayuda con cualquier consulta.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-secondary mb-2 flex items-start gap-2">
                <span className="text-primary">❓</span>
                ¿Puedo apartar un proyector?
              </h3>
              <p className="text-sm text-secondary/70 pl-6">
                Sí, con el 50% puedes reservar tu equipo. El stock se actualiza
                constantemente.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-100">
              <h3 className="font-bold text-secondary mb-2 flex items-start gap-2">
                <span className="text-primary">❓</span>
                ¿Qué cubre la garantía?
              </h3>
              <p className="text-sm text-secondary/70 pl-6">
                Cubre defectos de fábrica y componentes internos. No cubre daños
                por mal uso, golpes o líquidos derramados.
              </p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-sm text-secondary/70 mb-3">
              ¿Tienes más preguntas?
            </p>
            <a
              href="https://wa.me/51972300301?text=Hola%20iubizon,%20tengo%20algunas%20consultas"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-700 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escríbenos por WhatsApp
            </a>
          </div>
        </section>

        {/* Guarantee Information */}
        <div className="mt-12 p-6 bg-white rounded-xl text-center">
          <h3 className="text-lg font-semibold text-color-secondary mb-3">
            Garantía y Calidad Asegurada
          </h3>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Todos los equipos son funcionales
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Prueba de funcionamiento en local
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Garantía incluida
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Soporte técnico especializado
            </span>
          </div>
        </div>

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
                        Contratos de mantenimiento preventivo
                      </p>
                      <p className="text-sm text-secondary/70">
                        Planes personalizados para tu organización
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Atención prioritaria y soporte técnico
                      </p>
                      <p className="text-sm text-secondary/70">
                        Respuesta rápida a tus requerimientos
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Facturación electrónica disponible
                      </p>
                      <p className="text-sm text-secondary/70">
                        Cumplimiento normativo garantizado
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl flex-shrink-0">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-secondary">
                        Descuentos por volumen y contratos
                      </p>
                      <p className="text-sm text-secondary/70">
                        Mejores precios en servicios regulares
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
