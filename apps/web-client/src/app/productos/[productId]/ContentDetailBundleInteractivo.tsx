// components/ContentDetailBundleInteractivo.tsx
import React from "react";
import Image from "next/image";
import { Product } from "@/data-list/products";
import {
  Check,
  Monitor,
  Star,
  Target,
  Wrench,
  Headphones,
  Shield,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react";
import { DiagramSection } from "@/components/bundle-interactivo";
import { ComparisonSection, FAQSection } from "@/app/sections";

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
 * Enfocado exclusivamente en educación con orden persuasivo
 */
export default function ContentDetailBundleInteractivo({
  className,
  product,
}: Props) {
  return (
    <div className={cx("space-y-5", className)}>
      {/* Header - Propuesta de valor educativa */}
      <div className="space-y-1 text-center flex justify-center items-center flex-col">
        <Image
          src="/images/bundle-and-duo/bundle-logotipo.png"
          alt="Bundle interactivo - iubizon"
          width={620}
          height={210}
          className="object-contain p-1"
        />
        <h3 className="text-lg font-semibold text-white">
          Transforma tu aula en interactiva
        </h3>
        <p className="text-sm text-slate-300">
          Proyector Epson PowerLite 109W + Touch Tank + Adaptador Inalámbrico
          WiFi
        </p>

        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          <SoftChip>Solución completa</SoftChip>
          <SoftChip>Interactividad táctil</SoftChip>
          <SoftChip>Para aulas modernas</SoftChip>
        </div>
      </div>

      {/* Value / reassurance - Gancho inicial */}
      <div className="rounded-xl border border-gray/10 bg-linear-to-r from-green-500/25 to-transparent p-4 mb-10">
        <p className="text-xl font-semibold text-white">
          Todo lo que necesitas para clases interactivas
        </p>
        <p className="mt-2 text-md leading-relaxed text-slate-200">
          El Bundle Interactivo convierte cualquier aula en un espacio dinámico
          donde los estudiantes participan activamente.{" "}
          <span className="font-semibold text-white">
            Sin complicaciones, listo para usar desde el día 1.
          </span>
        </p>
      </div>

      {/* Comparación de precios - Primer gancho de venta */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
            $
          </span>
          <span className="text-lg font-bold text-primary drop-shadow">
            La mejor inversión para tu institución
          </span>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Bundle Interactivo */}
          <div className="flex-1 rounded-2xl border-2 border-emerald-400 bg-white/5 p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
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
              La opción más completa
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
              <li>Proyector with touch integrated</li>
              <li>Sin plataforma educativa</li>
              <li>Sin WiFi</li>
              <li>Precio muy elevado</li>
            </ul>
            <div className="text-2xl font-bold text-rose-400 mb-1">
              S/ 8,000+
            </div>
            <div className="text-xs text-rose-300 font-semibold">
              Más caro, menos features
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
              <li>Instalación compleja</li>
            </ul>
            <div className="text-2xl font-bold text-rose-400 mb-1">
              S/ 10,000+
            </div>
            <div className="text-xs text-rose-300 font-semibold">
              La más costosa
            </div>
          </div>
        </div>
        <div className="mt-4 text-slate-200 text-sm bg-white/5 p-4 rounded-lg">
          <span className="font-semibold text-amber-400">
            Con el Bundle Interactivo
          </span>{" "}
          obtienes todo lo necesario para transformar tus aulas al mejor precio.
          Proyector, touch y WiFi integrados con plataforma educativa incluida.
        </div>
      </div>

      {/* What includes (3 cards) */}
      <div className="space-y-7 mb-10">
        <p className="text-[1.4em] font-semibold text-white">
          ¿Qué incluye tu Bundle?
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
                  Proyector Epson 109W
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  Ideal para aulas iluminadas
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <Bullet>Alta luminosidad para clases con luz natural</Bullet>
              <Bullet>Imagen clara y nítida para todos los estudiantes</Bullet>
              <Bullet>Durable y confiable para uso diario</Bullet>
            </ul>

            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="relative h-30 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/proyector-epson-109w-2.jpg"
                  alt="Proyector Epson en aula"
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
                  Interactividad en la pared
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <Bullet tone="orange">
                <span className="font-semibold text-white">
                  &quot;Me conecto y listo&quot;
                </span>
              </Bullet>
              <Bullet tone="orange">Sin pagos de licencias (uso libre)</Bullet>
              <Bullet tone="orange">
                Funciona como mouse en cualquier programa
              </Bullet>
              <Bullet tone="orange">Ideal para colaboración en clase</Bullet>
            </ul>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="relative h-30 overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/sensor-touch-tank.webp"
                  alt="Touch Tank - sensor"
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
                  Sin cables, sin complicaciones
                </p>
              </div>
            </div>

            <ul className="mt-3 space-y-2">
              <Bullet tone="sky">Comparte pantalla sin cables</Bullet>
              <Bullet tone="sky">
                Funciona con laptops, tablets y smartphones
              </Bullet>
              <Bullet tone="sky">Clases más ordenadas y profesionales</Bullet>
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

        {/* Bonus de bundle */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mt-4">
          <p className="text-[1.1em] font-semibold text-white">
            ¿Por qué comprar el Bundle?
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-md text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                <Check className="w-4 h-4 text-green-400" />
              </span>
              <span>Todo compatible y optimizado entre sí</span>
            </div>
            <div className="flex items-center gap-2 text-md text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                <Check className="w-4 h-4 text-green-400" />
              </span>
              <span>Instalación rápida, sin problemas</span>
            </div>
            <div className="flex items-center gap-2 text-md text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                <Check className="w-4 h-4 text-green-400" />
              </span>
              <span>Un solo proveedor, un solo soporte</span>
            </div>
            <div className="flex items-center gap-2 text-md text-slate-200">
              <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                <Check className="w-4 h-4 text-green-400" />
              </span>
              <span>Precio especial vs comprarlo por separado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Educación - Beneficios para estudiantes y docentes */}
      <div className="space-y-10 mb-10">
        <p className="text-[1.4em] font-semibold text-white">
          Beneficios para tu institución
        </p>

        {/* Educación con PaperFlix */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-[1.2em] font-semibold text-white">
                PaperFlix - Plataforma Educativa
              </p>
              <p className="text-sm text-slate-300">
                Contenidos listos para cada grado
              </p>
            </div>
          </div>

          <div className="flex flex-column-2 gap-4 justify-between mb-5">
            <div className="mt-3 space-y-3">
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
              <div className="flex items-center gap-2 text-md text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-slate-950/40">
                  <Check className="w-4 h-4 text-green-400" />
                </span>
                <span>Recursos alineados al currículo</span>
              </div>
            </div>

            <div className="flex gap-1">
              <div className="relative h-auto w-[10em] md:w-[13em] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
                <Image
                  src="/images/bundle-and-duo/uso-con-ninos.webp"
                  alt="PaperFlix en el aula"
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

        {/* Beneficios para docentes y estudiantes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-lg font-semibold text-white">Para Docentes</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Clases más dinámicas e interactivas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Recursos educativos listos para usar</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Fácil de usar, sin capacitación necesaria</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Evalúa el progreso de los estudiantes</span>
              </li>
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-lg font-semibold text-white">
                Para Estudiantes
              </p>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Aprendizaje más interactivo y divertido</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Participación activa en clase</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Mejor comprensión de conceptos</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-400 mt-1" />
                <span>Trabajo colaborativo entre compañeros</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Easy to use */}
        <div>
          <p className="text-[1.4em] font-semibold text-white mb-3">
            Súper fácil de usar
          </p>
          <p className="mt-1 text-lg text-slate-200 mb-4">
            Funciona como mouse: si sabes usar tu laptop, ya sabes usar el Touch
            Tank. Sin complicaciones.
          </p>

          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="relative w-full aspect-2/2 min-h-45">
              <Image
                src="/images/bundle-and-duo/igual-a-un-mouse.webp"
                alt="Fácil de usar"
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
            <SoftChip>Listo para el aula</SoftChip>
          </div>
        </div>
      </div>

      {/* Servicio Incluido */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 mt-8">
        <p className="text-[1.4em] font-semibold text-white mb-4">
          Servicio Incluido con tu compra
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Instalación profesional
              </p>
              <p className="text-xs text-slate-300">
                Incluye instalación en tu institución
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Soporte especializado
              </p>
              <p className="text-xs text-slate-300">
                1 mes de soporte técnico incluido
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Garantía total</p>
              <p className="text-xs text-slate-300">
                6 meses de garantía por defectos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      <div className="mt-8">
        <p className="text-[1.4em] font-semibold text-white mb-4">
          Ve el Bundle Interactivo en acción
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden">
          <video
            className="w-full h-auto rounded-lg"
            autoPlay
            loop
            playsInline
            preload="metadata"
            muted
          >
            <source src="/videos/escuela.mp4" type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
        </div>
      </div>

      {/* DiagramSection - Cómo funciona */}
      <DiagramSection />

      {/* ComparisonSection - Por qué es mejor */}
      <ComparisonSection
        productName="Bundle Interactivo"
        price={product?.subTotal}
      />

      {/* FAQSection - Resolver dudas */}
      <FAQSection />

      {/* Summary */}
      <div className="relative rounded-2xl border-2 border-primary bg-linear-to-br from-primary/20 via-white/10 to-transparent p-6 shadow-xl overflow-hidden mt-8">
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/30 rounded-full blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-400/20 rounded-full blur-2xl opacity-50 pointer-events-none" />

        <div className="flex items-center gap-3 mb-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-2xl font-bold shadow-lg">
            <Target className="w-5 h-5" />
          </span>
          <span className="text-lg font-bold text-primary drop-shadow">
            Transforma tus aulas hoy
          </span>
        </div>

        <p className="text-base md:text-lg font-semibold text-white drop-shadow-sm">
          El Bundle Interactivo incluye todo lo que necesitas:{" "}
          <span className="text-primary font-bold">Proyector Epson 109W</span>
          <span className="text-orange-400 font-bold">
            {" "}
            + Touch interactivo
          </span>
          <span className="text-orange-300 font-bold"> + WiFi</span>
          <span className="text-amber-400 font-bold"> + PaperFlix</span>
        </p>
        <p className="mt-2 text-slate-300 text-sm">
          Con instalación profesional, soporte y garantía. La mejor inversión
          para la educación moderna.
        </p>
      </div>
    </div>
  );
}
