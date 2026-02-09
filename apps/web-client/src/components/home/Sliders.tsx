"use client";
import React, { ReactElement, useCallback, useState } from "react";
import { Pause, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { twMerge } from "tailwind-merge";
import { useDevice } from "@/hooks/useDevice";

export const SlidersComponent = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { isMobile, isMounted } = useDevice();

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [Autoplay({ delay: 10000, stopOnInteraction: false })],
  );

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const togglePause = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    if (isPaused) {
      autoplay.play();
    } else {
      autoplay.stop();
    }
    setIsPaused(!isPaused);
  }, [emblaApi, isPaused]);

  interface Slide {
    id: number;
    type: string;
    src?: string;
    srcMb?: string;
    alt?: string;
    ctaLink?: string;
    content?: ReactElement;
  }

  const slides: Slide[] = [
    {
      id: 1,
      type: "image",
      src: "/images/san-valentin/san-valentin-desktop.png",
      srcMb: "/images/san-valentin/san-valentin-mb.png",
      alt: "Promoción de San Valentín - Proyector HY350 con descuento especial en Lima, Perú",
      ctaLink:
        "/productos/Proyector-Led-Portatil-HY350-Magcubic-Full-Hd-1080p-Android",
    },
    {
      id: 2,
      type: "content",
      content: (
        <>
          <video
            autoPlay
            muted
            loop
            poster="/images/education-projectors.jpg"
            className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none"
          >
            <source src="/videos/education-projectors.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="w-full h-full flex flex-col justify-center items-center text-center text-white relative z-30 px-3 sm:px-6 lg:px-8 py-6 sm:py-8 mt-10 md:mt-1 text-sm">
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center w-full max-w-7xl gap-3 sm:gap-4 lg:gap-8">
              <div className="flex flex-col items-center lg:items-start justify-center text-center lg:text-left max-w-2xl w-full my-15">
                <h1 className="mt-2.5 sm:mt-3 md:mt-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
                  Venta y Servicio técnico de Proyectores
                </h1>
                <p className="mt-2 sm:mt-2.5 md:mt-3 text-xs sm:text-sm md:text-base lg:text-lg opacity-95 px-2 sm:px-0">
                  Proyectores nuevos y reacondicionados con garantía • Servicio
                  técnico especializado en Lima, Perú
                </p>
                <div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full text-left">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 md:p-4 border border-white/20">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                      <h2 className="font-bold text-xs sm:text-sm md:text-base">
                        Venta de Proyectores
                      </h2>
                    </div>
                    <p className="text-[10px] sm:text-xs opacity-90">
                      Equipos Epson nuevos y reacondicionados con garantía
                      extendida
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 md:p-4 border border-white/20">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <h2 className="font-bold text-xs sm:text-sm md:text-base">
                        Servicio Técnico
                      </h2>
                    </div>
                    <p className="text-[10px] sm:text-xs opacity-90">
                      Reparación, mantenimiento y reacondicionado profesional
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 md:mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 w-full relative z-40">
                  <Link
                    href="#lista"
                    className="w-full sm:w-auto rounded-full bg-primary px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all text-center"
                  >
                    Ver proyectores disponibles
                  </Link>
                  <Link
                    href="/servicios/tecnico/persona"
                    className="w-full sm:w-auto rounded-full border-2 border-white/70 bg-white/10 backdrop-blur-sm px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-[11px] sm:text-xs md:text-sm font-semibold text-white hover:bg-white/20 transition-all text-center"
                  >
                    Servicio técnico
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-center w-full lg:w-auto mt-3 sm:mt-4 lg:mt-0">
                <Image
                  src="/images/pet-saludando.png"
                  alt="iubizon - Venta de proyectores Epson y servicio técnico especializado en Lima, Perú"
                  width={500}
                  height={500}
                  className="w-[45%] sm:w-[40%] md:w-[35%] lg:w-[22em] h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </>
      ),
    },
  ];

  return (
    <div
      style={{
        background: `linear-gradient(135deg, #112237,#000 50%, #112237)`,
      }}
      className="carousel-container h-auto w-full relative overflow-hidden"
    >
      {/* Embla Carousel */}
      <div className="embla overflow-hidden h-auto w-full" ref={emblaRef}>
        <div className="embla__container flex h-auto w-full">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className={twMerge(
                "embla__slide min-w-0 w-full flex-[0_0_100%] relative",
                slide.type === "content" ? "h-auto" : "h-auto",
              )}
            >
              {slide.type === "content" ? (
                slide.content
              ) : (
                <Link href={slide.ctaLink!} className="cursor-pointer">
                  <div className="relative w-full h-full">
                    <Image
                      src={isMounted && isMobile ? slide.srcMb! : slide.src!}
                      alt={slide.alt!}
                      width={100}
                      height={100}
                      className="w-full h-full object-fill"
                      priority={slide?.id === 2}
                      sizes="100vw"
                    />
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-2 sm:gap-4 w-auto pointer-events-none">
          <button
            onClick={scrollPrev}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-1.5 sm:p-2 rounded-full transition-all border border-white/20 cursor-pointer pointer-events-auto"
            aria-label="Slide anterior"
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={togglePause}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-1.5 sm:p-2 rounded-full transition-all border border-white/20 cursor-pointer pointer-events-auto"
            aria-label={isPaused ? "Reanudar carousel" : "Pausar carousel"}
          >
            {isPaused ? (
              <Play className="w-4 h-4 sm:w-6 sm:h-6" />
            ) : (
              <Pause className="w-4 h-4 sm:w-6 sm:h-6" />
            )}
          </button>

          <button
            onClick={scrollNext}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-1.5 sm:p-2 rounded-full transition-all border border-white/20 cursor-pointer pointer-events-auto"
            aria-label="Siguiente slide"
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
