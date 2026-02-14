import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselItem {
  id: string;
  name: string;
  image: string;
  description?: string;
}

interface AppleCarouselProps {
  items: CarouselItem[];
  onSelect?: (index: number) => void;
  currentIndex?: number;
}

export const AppleCarousel: React.FC<AppleCarouselProps> = ({
  items,
  onSelect,
  currentIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  const handlePrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const newIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    onSelect?.(newIndex);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const newIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    onSelect?.(newIndex);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handleDotClick = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    onSelect?.(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      ref={carouselRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Main carousel container */}
      <div className="relative aspect-[4/3] md:aspect-video rounded-3xl overflow-hidden">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-all duration-700 ease-out ${
              index === activeIndex
                ? "opacity-100 scale-100 z-10"
                : index === activeIndex - 1 ||
                    (activeIndex === 0 && index === items.length - 1)
                  ? "opacity-0 scale-95 -translate-x-full z-0"
                  : "opacity-0 scale-95 translate-x-full z-0"
            }`}
            style={{
              transform: `translateX(${(index - activeIndex) * 100}%)`,
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center p-8 md:p-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.name}
                className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105"
                loading={index === activeIndex ? "eager" : "lazy"}
              />
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/50 via-transparent to-transparent pointer-events-none" />

            {/* Item info */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <h3 className="text-2xl md:text-3xl font-sfpro font-bold text-white mb-2">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-gray-400 text-sm md:text-base max-w-2xl mx-auto font-sfpro">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={handlePrevious}
        disabled={isTransitioning}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={handleNext}
        disabled={isTransitioning}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            disabled={isTransitioning}
            className={`transition-all duration-500 ${
              index === activeIndex
                ? "w-8 h-2 bg-primary rounded-full"
                : "w-2 h-2 bg-white/40 rounded-full hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
