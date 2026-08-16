"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id: number;
  image: string;
  alt: string;
  link?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/banner1.png",
    alt: "Promoción Banner 1 - Explorar Catálogo",
    link: "/search",
  },
  {
    id: 2,
    image: "/images/banner2.png",
    alt: "Promoción Banner 2 - IUBIZON",
  },
  {
    id: 3,
    image: "/images/banner3.png",
    alt: "Promoción Banner 3 - IUBIZON",
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

  const currentSlideIndex =
    ((page % slides.length) + slides.length) % slides.length;

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

  const slideContent = (
    <div className="relative w-full h-full">
      <Image
        src={slide.image}
        alt={slide.alt}
        fill
        priority={currentSlideIndex === 0}
        sizes="(max-width: 1200px) 100vw, 1200px"
        className="object-cover w-full h-full"
      />
    </div>
  );

  return (
    <div className="container pt-2 sm:pt-4 md:pt-6">
      <section
        className="relative w-full aspect-[896/199] overflow-hidden select-none rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200/80"
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
            className="absolute inset-0 w-full h-full"
          >
            {slide.link ? (
              <Link
                href={slide.link}
                className="block w-full h-full cursor-pointer"
              >
                {slideContent}
              </Link>
            ) : (
              slideContent
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={() => paginate(-1)}
          className="hidden sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => paginate(1)}
          className="hidden sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95"
          aria-label="Siguiente slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators Dots */}
        <div className="absolute bottom-2.5 sm:bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                const newDir = index > currentSlideIndex ? 1 : -1;
                setPage([index, newDir]);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlideIndex === index
                  ? "w-6 sm:w-7 bg-[#f25c05] shadow-sm"
                  : "w-2 sm:w-2.5 bg-white/70 hover:bg-white shadow-xs"
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
