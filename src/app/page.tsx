import React from "react";
import { BadgePercent, MapPin } from "lucide-react";
import { products } from "@/data-list/products";
import { ProductCard } from "@/components/ui/ProductCard";
import Image from "next/image";

export default function Home() {
  const premiumProducts = products.filter(
    (products) => products.classification === "premium",
  );

  const standardProducts = products.filter(
    (products) => products.classification === "standard",
  );

  const budgetProducts = products.filter(
    (products) => products.classification === "budget",
  );

  const clearanceProducts = products.filter(
    (products) => products.classification === "clearance",
  );

  const wholesaleProducts = products.filter(
    (products) => products.classification === "wholesale",
  );

  const quantityProjectors = products
    .filter((product) => product.type === "Proyector")
    .reduce((acc, product) => {
      return acc + product.units;
    }, 0);

  return (
    <div className="min-h-screen h-auto w-full bg-slate-50">
      <div
        style={{
          background: `linear-gradient(135deg, #112237,#000 50%, #112237)`,
        }}
        className="h-auto relative"
      >
        <video
          autoPlay
          muted
          loop
          poster="./images/education-projectors.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
        >
          <source src="./videos/education-projectors.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <header className="top-header absolute top-2 left-0 w-full p-4">
          <div className="item-logo">
            <Image
              width={300}
              height={100}
              src="/images/logo.png"
              alt="iubizon logo"
              className="w-[9em] h-auto object-contain m-auto"
            />
          </div>
        </header>
        <div className="w-full h-full m-auto flex justify-center flex-wrap text-center text-white relative">
          <div className="items m-[2em] relative flex flex-col items-center lg:items-start justify-center text-center lg:text-left pt-20 lg:pt-0">
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
              <BadgePercent className="h-4 w-4" /> Descuentos por volumen
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
              Venta de Proyectores <span className="opacity-90">Epson</span>
            </h1>
            <p className="mt-3 max-w-2xl md:text-lg opacity-95">
              De exhibición verificada • Totalmente funcionales • Precios bajos
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#lista"
                className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white-900 shadow hover:shadow-md"
              >
                Ver modelos disponibles
              </a>
              <a
                href="https://wa.me/51972300301"
                className="rounded-full border border-white/70 bg-transparent px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
          <div className="pet">
            <Image
              src="/images/pet-saludando.png"
              alt="pet iubizon"
              width={500}
              height={500}
              className="relative top-[1em] lg:top-[1em] right-[1em] w-[26em] md:w-[30em] mx-auto"
            />
          </div>
        </div>
      </div>

      <div className="border-y border-secondary/70">
        <div className="mx-auto flex max-w-[1370px] flex-col items-center gap-4 px-6 py-4 text-sm md:flex-row md:justify-between">
          <div className="flex items-center gap-2 text-[15px] text-secondary/70">
            <MapPin className="h-4 w-4" /> Chorrillos, Lima
          </div>
          <div className="flex items-center gap-2 text-[15px] text-secondary/70">
            <svg width="20" height="20" fill="black" viewBox="0 0 24 24">
              <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.12.55 4.18 1.6 6.01L0 24l6.09-1.59A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.63-.5-5.18-1.44l-.37-.22-3.62.95.97-3.52-.24-.37A9.94 9.94 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.03-7.47c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.41-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.19.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.54-.01-.19 0-.5.07-.76.34-.26.27-1 1-1 2.43s1.03 2.82 1.18 3.02c.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.65-.67 1.89-1.32.23-.65.23-1.21.16-1.32-.07-.11-.25-.18-.53-.32z" />
            </svg>{" "}
            WhatsApp: 972 300 301
          </div>
        </div>
      </div>
      <main id="lista" className="mx-auto max-w-[1370px] px-6 py-10">
        {premiumProducts.length > 0 && (
          <div className="!mt-10 !mb-[5em]">
            <div className="mt-6 mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary">
                  Modelos Premium
                </h2>
                <p className="text-sm text-secondary/70">
                  Stock actualizado • Prueba al recoger
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {premiumProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        {standardProducts.length > 0 && (
          <div className="!mt-10 !mb-[5em]">
            <div className="mt-6 mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-secondary">
                  Modelos Estándar
                </h2>
                <p className="text-sm text-secondary/70">
                  Stock actualizado • Prueba al recoger
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {standardProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        {budgetProducts.length > 0 && (
          <div className="!mt-10 !mb-[5em]">
            <div className="mt-6 mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-secondary">
                  Modelos Económicos
                </h2>
                <p className="text-sm text-secondary/70">
                  Stock actualizado • Prueba al recoger
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {budgetProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        {clearanceProducts.length > 0 && (
          <div className="!mt-10 !mb-[5em]">
            <div className="mt-6 mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-secondary">
                  Modelos en Remate
                </h2>
                <p className="text-sm text-secondary/70">
                  Stock actualizado • Prueba al recoger
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {clearanceProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        {wholesaleProducts.length > 0 && (
          <div className="!mt-10 !mb-[5em]">
            <div className="mt-6 mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-secondary">
                  Modelos por Lote
                </h2>
                <p className="text-sm text-secondary/70">
                  Stock actualizado • Prueba al recoger
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {wholesaleProducts.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))}
            </div>
          </div>
        )}

        <section className="mt-10 rounded-2xl p-6 text-center shadow-sm text-white  bg-gradient-to-br from-secondary/90 via-secondary to-secondary/90 relative">
          <Image
            src="/images/pet-corriendo-reverso.png"
            alt="pet iubizon"
            width={500}
            height={500}
            className="relative lg:absolute top-[1em] lg:top-[-8em] right-[1em] lg:right-[4em] w-[23em] mx-auto"
          />
          <h3 className="text-xl font-bold">
            🔥 Oferta por compra de lote Completo
          </h3>
          <p className="mt-1 opaproducty-90">
            {quantityProjectors} proyectores mixtos
          </p>
          <p className="mt-2 text-2xl font-extrabold text-primary">
            A UN PRECIO ESPECIAL
          </p>
          <p className="text-sm opacity-95">
            Entrega inmediata • Incluye prueba de funcionamiento
          </p>
          <a
            href="https://wa.me/51972300301?text=Hola%20iubizon,%20quiero%20el%20lote%20completo"
            target="_blank"
            className="mt-4 inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow bg-primary"
          >
            Reservar ahora
          </a>
        </section>
        <p className="mt-6 text-center text-xs text-secondary/70">
          Todos los equipos son de exhibición verificada. Algunos productos
          pueden tener detalles estéticos menores. Precios negociables.
        </p>
      </main>
    </div>
  );
}
