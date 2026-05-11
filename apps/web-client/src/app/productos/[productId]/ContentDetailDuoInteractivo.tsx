// components/ContentDetailDuoInteractivo.tsx
import React from "react";
import Image from "next/image";
import { Product } from "@/data-list/products";
import { Check, Star, Building2, GraduationCap, Zap, DollarSign, Target, Monitor } from "lucide-react";

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

export default function ContentDetailDuoInteractivo({
  className,
  product,
}: Props) {
  return (
    <div className={cx("space-y-5", className)}>
      {/* Header */}
      <div className="space-y-1 text-center flex justify-center items-center flex-col">
        <Image
          src="/productos/duo-interactivo/duo-interactivo-logotipo.png"
          alt="Duo interactivo - iubizon"
          width={400}
          height={100}
          className="object-contain p-1"
        />
        <h3 className="text-lg font-semibold text-white">Duo Interactivo es</h3>
        <p className="text-sm text-slate-300">
          Touch Tank + Adaptador Inalámbrico WiFi
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <SoftChip>Actualiza tu proyector</SoftChip>
          <SoftChip>Interactividad táctil</SoftChip>
          <SoftChip>Presentación sin cables</SoftChip>
        </div>
      </div>

      {/* Value / reassurance */}
      <div className="rounded-xl border border-gray/10 bg-linear-to-r from-green-500/25 to-transparent p-4 mb-10">
        <p className="text-xl font-semibold text-white">
          La actualización perfecta para tu proyector actual
        </p>
        <p className="mt-2 text-md leading-relaxed text-slate-200">
          Si ya tienes un proyector instalado, este Dúo lo convierte en una
          solución{" "}
          <span className="font-semibold text-white">
            interactiva e inalámbrica
          </span>
          , lista para usar.
        </p>
      </div>

      {/* What includes (2 cards) */}
      <div className="space-y-7 mb-10">
        <p className="text-[1.4em] font-semibold text-white">¿Qué incluye?</p>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
                  alt="Touch Tank Interactivo"
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

            {/* Pequeños “use cases” para entender rápido */}
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
                  alt="adaptador wifi uso"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* For Business */}
      <div className="space-y-7 mb-10">
        <p className="text-[1.4em] font-semibold text-white flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          Empresas y Oficinas
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
            Presentaciones sin cables si se quiere mostrar algo rapido
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
      <div className="space-y-7 mb-10">
        {/* Education */}
        <div className="space-y-2">
          <div>
            <p className="text-[1.4em] font-semibold text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              Educación (con PaperFlix Plataforma educativa)
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
                  <Check className="w-4 h-4 text-green-400" />
                </span>
                <span>Actividades dinámicas por grado</span>
              </div>
              <div className="flex items-center gap-2 text-md text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                  <Check className="w-4 h-4 text-green-400" />
                </span>
                <span>Mayor atención y participación</span>
              </div>
              <div className="flex items-center gap-2 text-md text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                  <Check className="w-4 h-4 text-green-400" />
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
          <p className="text-[1.4em] font-semibold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Súper fácil de usar
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
      </div>

      {/* Comparación de precios en cards */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
            <DollarSign className="w-5 h-5" />
          </span>
          <span className="text-lg font-bold text-primary drop-shadow">
            ¿Por qué el Dúo Interactivo es más accesible?
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Dúo Interactivo */}
          <div className="flex-1 rounded-2xl border-2 border-emerald-400 bg-white/5 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-lg font-bold text-emerald-400">
                Dúo Interactivo
              </span>
            </div>
            <div className="mb-3 w-full flex justify-center">
              <Image
                src="/images/bundle-and-duo/duo-interactivo.png"
                alt="Dúo Interactivo"
                width={200}
                height={90}
                className="rounded-lg object-contain bg-white"
              />
            </div>
            <ul className="mb-3 text-slate-200 text-sm space-y-1">
              <li>Touch Tank (interactividad táctil)</li>
              <li>WiFi inalámbrico</li>
              <li>Plataforma educativa</li>
              <li>Actualiza tu proyector actual</li>
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
              <Monitor className="w-6 h-6 text-blue-400" />
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
              <li>Proyector con función touch integrada</li>
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
              <Monitor className="w-6 h-6 text-gray-400" />
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
          <span className="font-semibold text-primary">El Dúo Interactivo</span>{" "}
          te permite actualizar tu proyector a una solución interactiva y
          educativa, a un precio mucho más accesible que un proyector
          interactivo o una pantalla touch.
        </div>
      </div>

      {/* Summary */}
      <div className="relative rounded-2xl border-2 border-primary bg-linear-to-br from-primary/20 via-white/10 to-transparent p-6 shadow-xl overflow-hidden mt-8">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/30 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl opacity-50 pointer-events-none" />
        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
            <Target className="w-5 h-5" />
          </span>
          <span className="text-lg font-bold text-primary drop-shadow">
            En resumen
          </span>
        </div>
        <p className="text-base md:text-lg font-semibold text-white drop-shadow-sm">
          Estás comprando una actualización innovadora completa para tu
          proyector:
          <span className="text-primary font-bold"> Touch interactivo</span>
          <span className="text-orange-400 font-bold">
            {" "}
            + conectividad inalámbrica
          </span>
          , con un plus educativo gracias a
          <span className="text-orange-300 font-bold">
            {" "}
            PaperFlix (Plataforma educativa)
          </span>{" "}
          si el uso es para educación .
        </p>
      </div>
    </div>
  );
}
