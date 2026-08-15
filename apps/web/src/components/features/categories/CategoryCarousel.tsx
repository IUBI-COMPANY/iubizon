"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { getCategoryIcon } from "@/lib/utils/categoryIcons";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
  }, [categories]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const allCategories = [{ id: "all", name: "Todas", slug: "" }, ...categories];

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white hidden group-hover:flex transition-colors"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4 text-[#112237]" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg rounded-full p-2 hover:bg-white hidden group-hover:flex transition-colors"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-4 h-4 text-[#112237]" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-4"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {allCategories.map((category, index) => {
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
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ scrollSnapAlign: "start" }}
            >
              <Link
                href={linkHref}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "text-primary"
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
