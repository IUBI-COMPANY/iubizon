// components/ContentDetailBundleInteractivo.tsx
import React from "react";
import Image from "next/image";
import { Product } from "@/data-list/products";

type Props = {
  className?: string;
  product: Product;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function SoftChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function Bullet({
  children,
  tone = "green",
}: {
  children: React.ReactNode;
  tone?: "green" | "orange" | "sky";
}) {
  const dot =
    tone === "orange"
      ? "bg-orange-300/90"
      : tone === "sky"
        ? "bg-sky-300/90"
        : "bg-emerald-400/80";

  return (
    <li className="flex gap-2 text-sm text-slate-200">
      <span className={cx("mt-1.75 h-2 w-2 shrink-0 rounded-full", dot)} />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

/**
 * Contenido para el card "Detalle del Producto" (Bundle Interactivo)
 * Basado 1:1 en el componente del Duo que ya refactorizaste, pero agregando el Proyector.
 */
export default function ContentDetailBundleInteractivo({
  className,
  product,
}: Props) {
  return (
    <div className={cx("space-y-5", className)}>
      {/* Header */}
      <div className="space-y-1 text-center flex justify-center items-center flex-col">
        <Image
          src="/images/bundle-and-duo/bundle-logotipo.png"
          alt="Bundle interactivo - iubizon"
          width={620}
          height={210}
          className="object-contain p-1"
        />
        <h3 className="text-lg font-semibold text-white">
          Bundle Interactivo es
        </h3>
        <p className="text-sm text-slate-300">
          Proyector Epson PowerLite 109W + Touch Tank + Adaptador Inalámbrico
          WiFi
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <SoftChip>Solución completa</SoftChip>
          <SoftChip>Interactividad táctil</SoftChip>
          <SoftChip>Presentación sin cables</SoftChip>
        </div>
      </div>

      {/* Value / reassurance */}
      <div className="rounded-xl border border-gray/10 bg-linear-to-r from-green-500/25 to-transparent p-4 mb-10">
        <p className="text-xl font-semibold text-white">
          Solución completa lista para usar
        </p>
        <p className="mt-2 text-md leading-relaxed text-slate-200">
          Este Bundle integra proyección + interactividad + conectividad para
          que tu sala o aula quede lista desde el día 1. Ideal si buscas una
          solución <span className="font-semibold text-white">todo en uno</span>
          , sin complicaciones.
        </p>
      </div>

      {/* What includes (3 cards) */}
      <div className="space-y-7 mb-10">
        <p className="text-[1.4em] font-semibold text-white">
          📦 ¿Qué incluye?
        </p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* Proyector */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/proyector-epson-109w.jpg"
                  alt="Proyector Epson PowerLite 109W"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Proyector Epson PowerLite 109W
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Proyección clara y potente para aulas, salas y capacitaciones.
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <Bullet>
                Ideal para espacios bien iluminados (presentaciones con mayor
                impacto)
              </Bullet>
              <Bullet>
                Experiencia profesional para presentaciones y multimedia
              </Bullet>
              <Bullet>
                Base confiable para una solución interactiva completa
              </Bullet>
            </ul>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="relative h-30 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/proyector-epson-109w-2.jpg"
                  alt="Proyector Epson uso en sala"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Touch Tank */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/touch.png"
                  alt="Touch Tank Interactivo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Touch Tank Interactivo
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Convierte la proyección en una superficie táctil para
                  colaborar en vivo.
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <Bullet tone="orange">
                Diseñado para salas:{" "}
                <span className="font-semibold text-white">
                  “me conecto y listo”
                </span>
              </Bullet>
              <Bullet tone="orange">
                Sin pagos de licencias obligatorias (uso libre en sala)
              </Bullet>
              <Bullet tone="orange">
                Compatible con cualquier programa (funciona como{" "}
                <span className="font-semibold text-white">mouse</span>)
              </Bullet>
              <Bullet tone="orange">
                Interacción natural y dinámica (ideal para colaboración)
              </Bullet>
            </ul>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="relative h-30 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/sensor-touch-tank.webp"
                  alt="Touch Tank - en mano"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-30 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/sensor-tank-touch-instalado.webp"
                  alt="Touch Tank - instalado"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* WiFi */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/adaptador-wifi.png"
                  alt="Adaptador Inalámbrico WiFi"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Adaptador Inalámbrico WiFi
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Presentaciones sin cables, más rápidas y ordenadas.
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <Bullet tone="sky">
                Streaming inalámbrico para presentaciones profesionales
              </Bullet>
              <Bullet tone="sky">
                Comparte desde laptops, tablets o smartphones
              </Bullet>
              <Bullet tone="sky">
                Elimina cables, adaptadores y pérdidas de tiempo
              </Bullet>
            </ul>

            <div className="mt-3 flex flex-wrap gap-2">
              <SoftChip>PowerPoint</SoftChip>
              <SoftChip>PDF</SoftChip>
              <SoftChip>Web</SoftChip>
              <SoftChip>Videollamadas</SoftChip>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="relative h-30 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/adaptador-wifi-use.jpg"
                  alt="Adaptador WiFi en uso"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bonus de bundle: por qué es mejor que comprar separado */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mt-4">
          <p className="text-[1.1em] font-semibold text-white">
            ⭐ Ventaja del Bundle
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-md text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                ✔
              </span>
              <span>Todo compatible y optimizado entre sí</span>
            </div>
            <div className="flex items-center gap-2 text-md text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                ✔
              </span>
              <span>Instalación más rápida y sin dudas de compatibilidad</span>
            </div>
          </div>
        </div>
      </div>

      {/* For Business */}
      <div className="space-y-7 mb-10">
        <p className="text-[1.4em] font-semibold text-white">
          🏢 Empresas y Oficinas
        </p>

        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 mb-5">
          <div className="flex items-center gap-2 text-lg text-slate-200">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400/80" />
            Reuniones más dinámicas e interactivas
          </div>
          <div className="flex items-center gap-2 text-lg text-slate-200">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400/80" />
            Colaboración en tiempo real
          </div>
          <div className="flex items-center gap-2 text-md text-slate-200">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400/80" />
            Presentaciones sin cables si se quiere mostrar algo rápido
          </div>
          <div className="flex items-center gap-2 text-lg text-slate-200">
            <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400/80" />
            Imagen más profesional frente a clientes
          </div>
        </div>

        <div>
          <Image
            src="/images/bundle-and-duo/uso-en-empresas.jpg"
            alt="Uso en empresas - iubizon"
            width={600}
            height={400}
            className="rounded-lg border w-full h-auto"
          />
        </div>
      </div>

      {/* Education + Easy to use */}
      <div className="space-y-10 mb-10">
        {/* Education */}
        <div className="space-y-2">
          <div>
            <p className="text-[1.4em] font-semibold text-white">
              🎓 Educación (con PaperFlix Plataforma educativa)
            </p>
            <p className="mt-1 text-lg text-slate-200">
              Plus para enseñanza dinámica: contenidos listos para usar y mayor
              participación en aula.
            </p>
          </div>

          <div className="flex flex-column-2 gap-4 justify-between mb-5">
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 text-md text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                  ✔
                </span>
                <span>Actividades dinámicas por grado</span>
              </div>
              <div className="flex items-center gap-2 text-md text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                  ✔
                </span>
                <span>Mayor atención y participación</span>
              </div>
              <div className="flex items-center gap-2 text-md text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                  ✔
                </span>
                <span>Mejora en comprensión y retención</span>
              </div>

              <p className="pt-2 text-sm text-slate-400">
                Ideal para modernizar aulas con proyectores ya instalados.
              </p>
            </div>

            <div className="flex gap-1">
              <div className="relative h-auto w-[10em] md:w-[13em] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/uso-con-ninos.webp"
                  alt="PaperFlix - plataforma educativa"
                  fill
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          <div>
            <Image
              src="/images/bundle-and-duo/paperflix.webp"
              alt="PaperFlix - plataforma educativa"
              width={600}
              height={400}
              className="rounded-lg border w-full h-auto"
            />
          </div>
        </div>

        {/* Easy + compatibility */}
        <div>
          <p className="text-[1.4em] font-semibold text-white">
            ⚡ Súper fácil de usar
          </p>
          <p className="mt-1 text-lg text-slate-200">
            Funciona como “mouse”: si sabes usar tu laptop, ya sabes usar el
            Touch Tank.
          </p>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative w-full aspect-2/2 min-h-45">
              <Image
                src="/images/bundle-and-duo/igual-a-un-mouse.webp"
                alt="Muy fácil de usar (como mouse)"
                fill
                className="rounded-lg border object-contain w-full h-full"
                priority
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
            <div className="relative w-full aspect-2/2 min-h-45">
              <Image
                src="/images/bundle-and-duo/compatible-con-todo.webp"
                alt="Compatible con todo"
                fill
                className="rounded-lg border object-contain w-full h-full"
                priority
                sizes="(max-width: 640px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <SoftChip>Sin licencias</SoftChip>
            <SoftChip>Sin complicaciones</SoftChip>
            <SoftChip>Listo para sala</SoftChip>
          </div>
        </div>

        {/* Comparación de precios en cards */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
              💸
            </span>
            <span className="text-lg font-bold text-primary drop-shadow">
              ¿Por qué el Bundle es más accesible?
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Bundle Interactivo */}
            <div className="flex-1 rounded-2xl border-2 border-emerald-400 bg-white/5 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🌟</span>
                <span className="text-lg font-bold text-emerald-400">
                  Bundle Interactivo
                </span>
              </div>
              <div className="mb-3 w-full flex justify-center">
                <Image
                  src="/images/bundle-and-duo/bundle-interactivo.png"
                  alt="Bundle Interactivo"
                  width={200}
                  height={90}
                  className="rounded-lg object-contain bg-white"
                />
              </div>
              <ul className="mb-3 text-slate-200 text-sm space-y-1">
                <li>Proyector Epson 109W</li>
                <li>Touch Tank (interactividad táctil)</li>
                <li>WiFi inalámbrico</li>
                <li>Plataforma educativa</li>
              </ul>
              <div className="text-2xl font-bold text-emerald-400 mb-1">
                S/{" "}
                {product?.subTotal?.toFixed
                  ? product.subTotal.toFixed(2)
                  : product?.subTotal}
              </div>
              <div className="text-xs text-emerald-300 font-semibold">
                Solución completa
              </div>
            </div>
            {/* Proyector Interactivo */}
            <div className="flex-1 rounded-2xl border-2 border-rose-500 bg-white/5 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎥</span>
                <span className="text-lg font-bold text-rose-400">
                  Proyector Interactivo
                </span>
              </div>
              <div className="mb-3 w-full flex justify-center">
                <Image
                  src="/images/bundle-and-duo/proyector-interactivo.webp"
                  alt="Proyector Interactivo"
                  width={170}
                  height={90}
                  className="rounded-lg object-contain bg-black"
                />
              </div>
              <ul className="mb-3 text-slate-200 text-sm space-y-1">
                <li>Proyector with touch integrated</li>
                <li>Sin plataforma educativa</li>
                <li>Sin WiFi</li>
                <li>Precio elevado por tecnología integrada</li>
              </ul>
              <div className="text-2xl font-bold text-rose-400 mb-1">
                S/ 8,000+
              </div>
              <div className="text-xs text-rose-300 font-semibold">
                Menos flexible, mayor costo
              </div>
            </div>
            {/* Pantalla Interactiva */}
            <div className="flex-1 rounded-2xl border-2 border-rose-500 bg-white/5 p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🖥️</span>
                <span className="text-lg font-bold text-rose-400">
                  Pantalla Interactiva
                </span>
              </div>
              <div className="mb-3 w-full flex justify-center">
                <Image
                  src="/images/bundle-and-duo/pantalla-interactiva.webp"
                  alt="Pantalla Interactiva"
                  width={170}
                  height={90}
                  className="rounded-lg object-contain bg-black"
                />
              </div>
              <ul className="mb-3 text-slate-200 text-sm space-y-1">
                <li>Pantalla touch (sin proyector)</li>
                <li>Sin plataforma educativa</li>
                <li>Sin WiFi</li>
                <li>Instalación compleja y costosa</li>
              </ul>
              <div className="text-2xl font-bold text-rose-400 mb-1">
                S/ 10,000+
              </div>
              <div className="text-xs text-rose-300 font-semibold">
                La opción más costosa
              </div>
            </div>
          </div>
          <div className="mt-4 text-slate-200 text-sm">
            <span className="font-semibold text-primary">
              El Bundle Interactivo
            </span>{" "}
            te da todo lo necesario para transformar tu espacio en interactivo,
            a un precio mucho más accesible que un proyector interactivo o una
            pantalla touch, y con más valor que un proyector tradicional.
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="relative rounded-2xl border-2 border-primary bg-linear-to-br from-primary/20 via-white/10 to-transparent p-6 shadow-xl overflow-hidden mt-8">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/30 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl opacity-50 pointer-events-none" />

        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
            🎯
          </span>
          <span className="text-lg font-bold text-primary drop-shadow">
            En resumen
          </span>
        </div>

        <p className="text-base md:text-lg font-semibold text-white drop-shadow-sm">
          Estás comprando una solución completa lista para usar:
          <span className="text-primary font-bold">
            {" "}
            Proyección (Epson 109W)
          </span>
          <span className="text-orange-400 font-bold">
            {" "}
            + Touch interactivo
          </span>
          <span className="text-orange-300 font-bold">
            {" "}
            + conectividad inalámbrica
          </span>
          , con un plus educativo gracias a
          <span className="text-orange-300 font-bold">
            {" "}
            PaperFlix (Plataforma educativa)
          </span>{" "}
          si el uso es para educación.
        </p>
      </div>
    </div>
  );
}
