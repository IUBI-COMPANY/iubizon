'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

interface CategoryCarouselProps {
  categories: Category[];
  activeSlug?: string;
}

export function CategoryCarousel({ categories, activeSlug }: CategoryCarouselProps) {
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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const allCategories = [
    { id: 'all', name: 'Todas', slug: '', icon: '🏠' },
    ...categories,
  ];

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 hidden group-hover:flex"
        >
          <ChevronLeft className="w-5 h-5 text-[#112237]" />
        </button>
      )}
      
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 hidden group-hover:flex"
        >
          <ChevronRight className="w-5 h-5 text-[#112237]" />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {allCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ scrollSnapAlign: 'start' }}
          >
            <Link
              href={category.slug ? `/categories/${category.slug}` : '/'}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all ${
                activeSlug === category.slug || (!activeSlug && category.slug === '')
                  ? 'bg-[#f25c05] text-white shadow-md'
                  : 'bg-white border border-[#e2e8f0] text-[#112237] hover:border-[#f25c05] hover:shadow-md'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}