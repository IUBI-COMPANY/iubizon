"use client";

import { useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/categoryIcons";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

interface CategoryCarouselProps {
  categories: Category[];
  activeCategoryId?: string;
  activeSlug?: string;
}

export function CategoryCarousel({
  categories,
  activeCategoryId,
  activeSlug,
}: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseCategories = [
    { id: "all", name: "Todas", slug: "" },
    ...categories,
  ];

  // Triplicamos la lista únicamente para permitir el scroll infinito circular sin alterar el diseño original
  const infiniteCategories = [
    ...baseCategories.map((c) => ({ ...c, uniqueId: `prev-${c.id}` })),
    ...baseCategories.map((c) => ({ ...c, uniqueId: `curr-${c.id}` })),
    ...baseCategories.map((c) => ({ ...c, uniqueId: `next-${c.id}` })),
  ];

  useEffect(() => {
    if (scrollRef.current) {
      const thirdWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.scrollLeft = thirdWidth;
    }
  }, [categories]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const thirdWidth = scrollWidth / 3;

    if (scrollLeft < 20) {
      scrollRef.current.scrollLeft = scrollLeft + thirdWidth;
    } else if (scrollLeft + clientWidth >= scrollWidth - 20) {
      scrollRef.current.scrollLeft = scrollLeft - thirdWidth;
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={() => scroll("left")}
        className="sm:flex absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/10 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-4 h-4 text-[#112237]" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="sm:flex absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/10 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-110 active:scale-95"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-4 h-4 text-[#112237]" />
      </button>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {infiniteCategories.map((category, index) => {
          const isActive =
            category.id === "all"
              ? !activeCategoryId && !activeSlug
              : category.id === activeCategoryId ||
                category.slug === activeSlug;

          const Icon =
            category.slug === "" ? LayoutGrid : getCategoryIcon(category.slug);

          const linkHref =
            category.id === "all"
              ? "/search"
              : `/search?category_id=${category.id}`;

          return (
            <motion.div
              key={`${category.uniqueId}-${index}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ scrollSnapAlign: "start" }}
            >
              <Link
                href={linkHref}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-[#112237] hover:text-primary"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon className="w-7 h-7 shrink-0" />
                  <span className="text-xs font-medium text-wrap text-center leading-3.5">
                    {category.name}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
