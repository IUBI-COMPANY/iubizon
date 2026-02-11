"use client";
import React, { useEffect, useState } from "react";
import { Product } from "@/data-list/products";
import Image from "next/image";
import Link from "next/link";
import { getWhatsAppMessage } from "@/utils/whatsapp";
import {
  Palette,
  Cast,
  Mic,
  Volume2,
  Zap,
  MonitorPlay,
  Smartphone,
  Wifi,
  Box,
  Weight,
} from "lucide-react";

interface SpecialProductProps {
  product: Product;
}

export const EPSONFH02 = ({ product }: SpecialProductProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const originalPrice = product.oldPrice || 1299.0;
  const discountedPrice = product.price || 999.0;
  const discountPercentage = Math.round(
    ((originalPrice - discountedPrice) / originalPrice) * 100,
  );

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVideoModalOpen]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-0 md:p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div className="relative w-full max-w-6xl mx-0 md:mx-4">
            {/* Close Button */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-2 right-2 md:-top-12 md:right-0 z-10 text-white hover:text-blue-400 transition-colors bg-black/50 md:bg-transparent rounded-full p-2 md:p-0"
              aria-label="Cerrar video"
            >
              <svg
                className="w-8 h-8 md:w-10 md:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video Container */}
            <div
              className="relative w-full aspect-video rounded-none md:rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/20 border-2 border-blue-400/30"
              onClick={(e) => e.stopPropagation()}
            >
              <video autoPlay controls className="w-full h-full object-contain">
                <source src="/videos/epiqvision-fh02.webm" type="video/webm" />
                Tu navegador no soporta la reproducción de video.
              </video>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source src="/videos/epiqvision-fh02.webm" type="video/webm" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/50 via-purple-900/40 to-black" />

        {/* Elementos decorativos flotantes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div
            className="absolute w-32 h-32 border-2 border-blue-400/30 rounded-full"
            style={{
              left: "10%",
              top: "15%",
              animation: "floatSlow 8s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-24 h-24 border-2 border-purple-400/30 rounded-full"
            style={{
              left: "80%",
              top: "25%",
              animation: "floatSlow 10s ease-in-out infinite 2s",
            }}
          />

          <style jsx>{`
            @keyframes floatSlow {
              0%,
              100% {
                transform: translateY(0) translateX(0);
              }
              50% {
                transform: translateY(-30px) translateX(20px);
              }
            }
          `}</style>
        </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
          <div className="mb-6 inline-block">
            <span className="text-sm md:text-base font-semibold tracking-[0.3em] uppercase bg-gradient-to-r from-white via-blue-400 to-white bg-clip-text text-transparent">
              Epson EpiqVision FH02
            </span>
          </div>

          <h1
            className="text-5xl md:text-7xl lg:text-9xl font-bold mt-24 mb-6 leading-none"
            style={{
              transform: `translateY(${scrollY * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollY / 300),
              transition: "transform 0.1s ease-out, opacity 0.1s ease-out",
            }}
          >
            <span className="block bg-gradient-to-r from-blue-200 via-blue-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(59,130,246,0.8)] filter brightness-125">
              Proyección
            </span>
            <span className="block mt-2 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
              Portátil
            </span>
            <span className="block mt-2 bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(59,130,246,0.8)] filter brightness-125">
              Inteligente
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl lg:text-3xl font-light mb-8 text-gray-300 max-w-3xl mx-auto"
            style={{
              opacity: Math.max(0, 1 - scrollY / 400),
              transition: "opacity 0.1s ease-out",
            }}
          >
            Android TV • Full HD 1080p • 3000 Lúmenes • Hasta 300&quot;
          </p>

          {/* Price Display */}
          <div
            className="mb-8"
            style={{
              opacity: Math.max(0, 1 - scrollY / 400),
              transition: "opacity 0.1s ease-out",
            }}
          >
            <div className="flex flex-col items-center gap-3 mb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-gray-400 line-through text-lg md:text-2xl">
                  s/ {originalPrice.toFixed(2)}
                </span>
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-lg shadow-blue-500/50">
                  -{discountPercentage}%
                </span>
              </div>
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                s/ {discountedPrice.toFixed(2)}
              </div>
            </div>
            <p className="text-white/60 text-xs md:text-base text-center px-4">
              + IGV • Total a pagar:{" "}
              <span className="text-white/90 font-semibold">
                s/ {product.totalPayment?.toFixed(2)}
              </span>
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4"
            style={{
              opacity: Math.max(0, 1 - scrollY / 450),
              transition: "opacity 0.1s ease-out",
            }}
          >
            <a
              href={`https://wa.me/51972300301?text=${getWhatsAppMessage(product)}`}
              className="group relative bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white px-6 md:px-10 py-4 md:py-5 rounded-full text-base md:text-lg font-semibold overflow-hidden transition-all transform hover:scale-105 shadow-xl shadow-blue-500/50 animate-pulse hover:shadow-blue-500/70 w-full sm:w-auto text-center"
            >
              <span className="relative z-10">
                SÍ, LO QUIERO · s/ {discountedPrice.toFixed(2)}
              </span>
            </a>
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="border-2 border-blue-400/50 backdrop-blur-sm text-white px-6 md:px-10 py-4 md:py-5 rounded-full text-base md:text-lg font-semibold hover:bg-blue-500/20 hover:border-blue-400/80 transition-all shadow-lg w-full sm:w-auto"
            >
              ▶ Ver Video
            </button>
          </div>
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400"
            style={{
              opacity: Math.max(0, 1 - scrollY / 450),
              transition: "opacity 0.1s ease-out",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Envío GRATIS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Garantía 2 años</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Pago seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">⭐</span>
              <span>4.5/5 (86 reseñas)</span>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-400/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Product Showcase Grid */}
      <section
        id="galeria"
        className="py-32 px-4 bg-gradient-to-b from-black via-blue-900/10 to-black relative overflow-hidden"
      >
        {/* Texto decorativo de fondo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <h2 className="text-[20vw] md:text-[15vw] font-black text-blue-500/5 whitespace-nowrap">
            FH02
          </h2>
        </div>

        {/* Círculos decorativos flotantes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 border-4 border-blue-400/15 rounded-full animate-pulse" />
          <div
            className="absolute bottom-40 left-10 w-48 h-48 border-4 border-purple-400/15 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-4">
            Características
            <span className="block mt-2 bg-gradient-to-r from-blue-200 via-blue-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              Destacadas
            </span>
          </h2>
          <p className="text-center text-blue-400/70 mb-20 text-sm">
            Proyector Portátil con Android TV
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image 1 - Flyer 3 (Pantalla Gigante) - Full Width */}
            <article className="md:col-span-2 flex flex-col">
              <div className="relative w-full h-auto rounded-3xl overflow-hidden group bg-gray-900 mb-6 ring-2 ring-blue-400/30">
                <Image
                  src="/productos/FH02/flyer3.jpg"
                  alt="Pantalla de hasta 300 pulgadas - Epson EpiqVision FH02"
                  width={1600}
                  height={900}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="text-center max-w-4xl mx-auto">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Pantalla de hasta 300&quot;
                </h3>
                <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                  Disfruta de una experiencia visual impresionante, hasta 4
                  veces más grande que una TV de 75&quot;. El proyector Epson
                  EpiqVision FH02 brinda una pantalla de hasta 300&quot; en Full
                  HD, perfecto para ver tus contenidos favoritos, eventos
                  deportivos, videojuegos, películas y más.
                </p>
              </div>
            </article>

            {/* Image 2 - Flyer 1 (Android TV) */}
            <article className="flex flex-col">
              <div className="relative w-full h-auto rounded-3xl overflow-hidden group bg-gray-900 mb-6 ring-2 ring-blue-400/30">
                <Image
                  src="/productos/FH02/flyer1.jpg"
                  alt="Android TV integrado - Epson EpiqVision FH02"
                  width={1200}
                  height={800}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                Android TV Integrado
              </h3>
              <p className="text-gray-400 leading-relaxed text-base">
                Interfaz de Android TV con un control remoto fácil de usar, que
                incluye búsqueda por voz con Google Assistant incorporado. Ve
                todos tus canales de transmisión favoritos: Netflix, Apple TV+,
                Amazon Prime, Hulu, Disney+, HBO Max, YouTube y más. Incluso
                transmite TV en vivo.
              </p>
            </article>

            {/* Image 3 - Flyer 2 (Brillo Superior) */}
            <article className="flex flex-col">
              <div className="relative w-full h-auto rounded-3xl overflow-hidden group bg-gray-900 mb-6 ring-2 ring-blue-400/30">
                <Image
                  src="/productos/FH02/fyer2.jpg"
                  alt="3000 lúmenes de brillo - Epson EpiqVision FH02"
                  width={1200}
                  height={800}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-white">
                3000 Lúmenes de Brillo Superior
              </h3>
              <p className="text-gray-400 leading-relaxed text-base">
                3000 lúmenes de color y brillo blanco brindan imágenes de
                excelente calidad en una variedad de condiciones de iluminación.
                La tecnología 3LCD avanzada muestra el 100% de la señal de color
                RGB para cada cuadro, permitiendo una precisión de color
                sobresaliente sin problemas de arco iris.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Tech Specs Section */}
      <section
        id="especificaciones"
        className="py-10 px-4 bg-gradient-to-b from-black via-blue-900/5 to-gray-950 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-1/4 -left-20 text-[15vw] md:text-[10vw] font-black text-blue-400/10 rotate-[-15deg] whitespace-nowrap">
            SPECS
          </div>
          <div className="absolute bottom-1/4 -right-20 text-[15vw] md:text-[10vw] font-black text-purple-400/10 rotate-[15deg] whitespace-nowrap">
            TECH
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[25vw] md:text-[18vw] font-black text-blue-500/5 whitespace-nowrap">
            FH02
          </div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-3 md:mb-4">
            Especificaciones
            <span className="block mt-2 bg-gradient-to-r from-blue-200 via-blue-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              Técnicas
            </span>
          </h2>
          <p className="text-center text-blue-400/70 mb-12 md:mb-20 text-xs md:text-sm">
            Proyector Portátil Inteligente
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 md:gap-x-20 gap-y-4 md:gap-y-8">
            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                  Brillo
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  3000 lúmenes
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 md:w-5 md:h-5" />
                  Resolución
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  Full HD 1080p
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <Smartphone className="w-4 h-4 md:w-5 md:h-5" />
                  Sistema Operativo
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  Android TV
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 md:w-5 md:h-5" />
                  Tecnología
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  3LCD
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 md:w-5 md:h-5" />
                  Tamaño de pantalla
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  Hasta 300&quot;
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <Wifi className="w-4 h-4 md:w-5 md:h-5" />
                  Conectividad
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  HDMI • WiFi • Bluetooth
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <Box className="w-4 h-4 md:w-5 md:h-5" />
                  Dimensiones
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  32 x 21.1 x 8.2 cm
                </span>
              </div>
            </div>

            <div className="group">
              <div className="flex justify-between items-baseline py-4 md:py-6 border-b border-gray-800 hover:border-blue-400 transition-colors">
                <span className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
                  <Weight className="w-4 h-4 md:w-5 md:h-5" />
                  Peso
                </span>
                <span className="text-white text-base md:text-xl font-semibold group-hover:text-blue-400 transition-colors text-right">
                  2.6 kg
                </span>
              </div>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-12 md:mt-20 p-6 md:p-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl border border-blue-400/30 shadow-lg shadow-blue-500/10">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <span>Características Adicionales</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-gray-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 flex items-center justify-center flex-shrink-0 border border-blue-400/30">
                  <Palette className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm md:text-base">
                  Corrección de color adaptativa avanzada
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 flex items-center justify-center flex-shrink-0 border border-blue-400/30">
                  <Cast className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm md:text-base">
                  Chromecast integrado
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 flex items-center justify-center flex-shrink-0 border border-blue-400/30">
                  <Mic className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm md:text-base">
                  Google Assistant con control por voz
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 flex items-center justify-center flex-shrink-0 border border-blue-400/30">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-sm md:text-base">
                  Parlantes de alta calidad
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Price Details Section */}
      <section className="py-20 px-4 bg-black relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            Detalle de
            <span className="block mt-2 bg-gradient-to-r from-blue-200 via-blue-400 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              Precios
            </span>
          </h2>
          <p className="text-center text-blue-400/70 mb-12 text-sm">
            Precios Especiales - Oferta Limitada
          </p>

          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-blue-400/30 rounded-2xl p-6 md:p-8 shadow-2xl shadow-blue-500/20">
            {/* Precio Original */}
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-800">
              <span className="text-gray-400 text-sm md:text-lg">
                Precio Regular:
              </span>
              <span className="text-lg md:text-2xl font-bold text-gray-400 line-through">
                S/ {originalPrice.toFixed(2)}
              </span>
            </div>

            {/* Descuento */}
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-800">
              <span className="text-blue-400 text-xs md:text-lg font-semibold">
                Descuento Especial ({discountPercentage}%):
              </span>
              <span className="text-lg md:text-2xl font-bold text-blue-400">
                - S/ {(originalPrice - discountedPrice).toFixed(2)}
              </span>
            </div>

            {/* Precio con Descuento */}
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-800">
              <span className="text-white text-sm md:text-lg font-semibold">
                Precio con Descuento:
              </span>
              <span className="text-lg md:text-2xl font-bold text-white">
                S/ {discountedPrice.toFixed(2)}
              </span>
            </div>

            {/* SubTotal */}
            <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-800">
              <span className="text-gray-400 text-sm md:text-lg">
                SubTotal:
              </span>
              <span className="text-base md:text-xl font-semibold text-gray-300">
                S/ {product.subTotal?.toFixed(2)}
              </span>
            </div>

            {/* IGV */}
            <div className="flex items-center justify-between mb-4 md:mb-6 pb-4 md:pb-6 border-b-2 border-blue-400/30">
              <span className="text-gray-400 text-sm md:text-lg">
                IGV (18%):
              </span>
              <span className="text-base md:text-xl font-semibold text-gray-300">
                S/ {product.IGV?.toFixed(2)}
              </span>
            </div>

            {/* Total a Pagar */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg md:text-2xl font-bold text-white">
                  Total a Pagar:
                </span>
                <span className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  S/ {product.totalPayment?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Nota informativa */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ℹ️ Los precios incluyen IGV y están sujetos a disponibilidad de
                stock
              </p>
            </div>
          </div>

          {/* Beneficios adicionales */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">✨</div>
              <h4 className="text-blue-400 font-bold mb-1">Ahorro Real</h4>
              <p className="text-xs text-gray-400">
                S/ {(originalPrice - discountedPrice).toFixed(2)} de descuento
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="text-purple-400 font-bold mb-1">
                Garantía Extendida
              </h4>
              <p className="text-xs text-gray-400">Hasta 2 años registrando</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-900/30 to-blue-900/30 border border-indigo-400/30 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🚚</div>
              <h4 className="text-indigo-400 font-bold mb-1">Envío Incluido</h4>
              <p className="text-xs text-gray-400">
                Gratis en Lima Metropolitana
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="comprar"
        className="relative py-20 md:py-32 px-4 overflow-hidden"
      >
        {/* Background con gradiente */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600" />

        {/* Efectos de partículas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-3 h-3 bg-blue-300 rounded-full blur-sm animate-pulse shadow-lg shadow-blue-300/50" />
          <div
            className="absolute top-[30%] right-[20%] w-2 h-2 bg-purple-300 rounded-full blur-sm animate-pulse shadow-lg shadow-purple-300/50"
            style={{ animationDelay: "0.5s" }}
          />
          <div
            className="absolute bottom-[40%] left-[25%] w-2.5 h-2.5 bg-blue-400 rounded-full blur-sm animate-pulse shadow-lg shadow-blue-400/50"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Urgency Indicator */}
          <div className="mb-4 md:mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 px-3 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-base font-bold animate-pulse shadow-lg shadow-blue-500/50">
            <span className="relative flex h-2 w-2 md:h-3 md:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-white"></span>
            </span>
            <span className="leading-tight">OFERTA POR TIEMPO LIMITADO</span>
          </div>

          <div className="mb-3 md:mb-4 text-3xl md:text-4xl animate-bounce">
            🎬
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-3 md:mb-4 px-2 leading-tight">
            <span className="block bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(59,130,246,0.8)] filter brightness-125">
              Lleva el Cine
            </span>
            <span className="block mt-2 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(147,51,234,0.8)] filter brightness-125">
              A Tu Hogar
            </span>
          </h2>
          <p className="text-white mb-4 md:mb-6 text-base md:text-xl font-semibold drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
            Proyector Portátil Inteligente con Android TV
          </p>

          {/* Price Section */}
          <div className="mb-5 md:mb-6">
            <div className="flex flex-col items-center gap-2 md:gap-3 mb-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-white/70 line-through text-base md:text-2xl lg:text-3xl">
                  s/ {originalPrice.toFixed(2)}
                </span>
                <span className="bg-white text-blue-600 px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-lg font-bold animate-pulse shadow-lg shadow-white/50">
                  AHORRA {discountPercentage}%
                </span>
              </div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
                s/ {discountedPrice.toFixed(2)}
              </div>
            </div>
            <p className="text-white/70 text-xs md:text-base mb-2 px-4 text-center">
              + IGV • Total a pagar:{" "}
              <span className="text-white font-semibold">
                s/ {product.totalPayment?.toFixed(2)}
              </span>
            </p>
            <p className="text-white text-sm md:text-lg font-semibold text-center">
              ⚡ ¡Ahorra s/ {(originalPrice - discountedPrice).toFixed(2)} HOY!
            </p>
          </div>

          {/* Stock Indicator */}
          {product.stock > 0 && product.stock <= 10 && (
            <div className="mb-6 md:mb-8 bg-white/10 border-2 border-white/20 rounded-2xl p-4 md:p-6 max-w-md mx-auto backdrop-blur-md">
              <div className="flex items-center justify-between mb-3 gap-2">
                <span className="text-white text-sm md:text-base">
                  Stock disponible:
                </span>
                <span className="text-blue-200 font-bold text-sm md:text-base">
                  {product.stock} unidades
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 md:h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 md:h-3 rounded-full animate-pulse"
                  style={{ width: `${(product.stock / 10) * 100}%` }}
                ></div>
              </div>
              <p className="text-white text-xs md:text-sm font-semibold animate-pulse leading-tight">
                ⚡ ¡Solo quedan {product.stock} unidades! Se están agotando
                rápido
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Link
            href={`https://wa.me/51972300301?text=${getWhatsAppMessage(product)}`}
            className="inline-flex items-center justify-center gap-2 md:gap-3 bg-white hover:bg-white/90 text-blue-600 px-6 md:px-16 py-4 md:py-7 rounded-full text-sm md:text-xl lg:text-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105 mb-6 animate-pulse w-full sm:w-auto max-w-full shadow-lg"
          >
            <span className="text-center leading-tight">
              ⚡ SÍ, LO QUIERO CON DESCUENTO
            </span>
            <svg
              className="w-4 h-4 md:w-7 md:h-7 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>

          {/* Risk Reversal - Garantías */}
          <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 md:p-4">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">🚚</div>
              <h4 className="font-bold text-white mb-1 text-sm md:text-base">
                Envío GRATIS
              </h4>
              <p className="text-xs md:text-sm text-gray-400">
                En Lima Metropolitana
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 md:p-4">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">🛡️</div>
              <h4 className="font-bold text-white mb-1 text-sm md:text-base">
                Garantía 2 Años
              </h4>
              <p className="text-xs md:text-sm text-gray-400">
                Extensible registrando
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 md:p-4">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">💳</div>
              <h4 className="font-bold text-white mb-1 text-sm md:text-base">
                Pago Seguro
              </h4>
              <p className="text-xs md:text-sm text-gray-400">
                Múltiples métodos
              </p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-xs md:text-sm flex-wrap">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs">
                👤
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-xs">
                👤
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-xs">
                👤
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-xs">
                👤
              </div>
            </div>
            <p className="text-gray-300 text-center leading-tight">
              <span className="text-blue-200 font-bold">
                4.5/5 estrellas (86 reseñas)
              </span>{" "}
              en Epson.com
            </p>
          </div>

          <p className="text-xs md:text-sm text-gray-500 mt-4 md:mt-6 px-4 leading-relaxed">
            ⚡ Soporte técnico especializado • Instalación guiada • Asesoría
            personalizada
          </p>
        </div>
      </section>
    </div>
  );
};
