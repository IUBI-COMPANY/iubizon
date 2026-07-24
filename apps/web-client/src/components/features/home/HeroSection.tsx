"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  bgGradient: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Encuentra lo que necesitas en iubizon.com",
    subtitle: "La plataforma de productos multimedia para empresas y colegios.",
    bgGradient: "from-[#112237] via-[#1c385c] to-[#f25c05]",
  },
  {
    id: 2,
    title: "Proyectores y Equipos Multimedia",
    subtitle: "Soluciones de tecnología audiovisual de alta calidad al mejor precio de Perú.",
    bgGradient: "from-[#0f172a] via-[#1e293b] to-[#0284c7]",
  },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};

export const HeroSection = () => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const currentSlideIndex = ((page % slides.length) + slides.length) % slides.length;

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [paginate, isHovered]);

  const slide = slides[currentSlideIndex];

  return (
    <section
      className="relative w-full h-[220px] sm:h-[250px] md:h-[280px] overflow-hidden select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} text-white flex items-center justify-center px-4`}
        >
          {/* Decorative Orbs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-20 -translate-y-20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-32 translate-y-32 pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-[#f25c05]/20 rounded-full blur-xl pointer-events-none" />

          {/* Content */}
          <div className="container mx-auto relative z-10 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 font-light max-w-2xl mx-auto">
                {slide.subtitle}
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <button
        onClick={() => paginate(-1)}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={() => paginate(1)}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95"
        aria-label="Siguiente slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Slide Indicators Dots */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              const newDir = index > currentSlideIndex ? 1 : -1;
              setPage([index, newDir]);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentSlideIndex === index
                ? "w-6 bg-[#f25c05]"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
