"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "./Button";

interface CarouselProps {
  children: ReactNode[];
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  autoPlay?: boolean;
  autoPlayInterval?: number;
  infinite?: boolean;
  className?: string;
}

export function Carousel({
  children,
  itemsPerView = { mobile: 1, tablet: 3, desktop: 5 },
  autoPlay = false,
  autoPlayInterval = 3000,
  infinite = false,
  className = "",
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsVisible, setItemsVisible] = useState(itemsPerView.desktop);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para swipe táctil
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalItems = children.length;
  const maxIndex = infinite
    ? totalItems
    : Math.max(0, totalItems - itemsVisible);

  // Duplicar items para efecto infinito
  const displayItems = infinite
    ? [...children, ...children, ...children]
    : children;

  // Responsive items per view
  useEffect(() => {
    function updateItemsPerView() {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsVisible(itemsPerView.mobile);
      } else if (width < 1024) {
        setItemsVisible(itemsPerView.tablet);
      } else {
        setItemsVisible(itemsPerView.desktop);
      }
    }

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [itemsPerView]);

  // Inicializar en el medio para infinite scroll
  useEffect(() => {
    if (infinite) {
      setCurrentIndex(totalItems);
      setIsTransitioning(false);
    }
  }, [infinite, totalItems]);

  // Auto play
  useEffect(() => {
    if (!autoPlay) return;

    autoPlayRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentIndex((prev) => {
        if (infinite) {
          return prev + 1;
        }
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, autoPlayInterval);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, autoPlayInterval, maxIndex, infinite]);

  // Efecto para resetear posición cuando se llega al límite (infinite scroll)
  useEffect(() => {
    if (!infinite) return;

    if (currentIndex >= totalItems * 2) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalItems);
      }, 500);
      return () => clearTimeout(timeout);
    }

    if (currentIndex <= 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(totalItems);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, totalItems, infinite]);

  const goToNext = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (infinite) {
        return prev + 1;
      }
      return Math.min(prev + 1, maxIndex);
    });
  };

  const goToPrev = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    setIsTransitioning(true);
    setCurrentIndex((prev) => {
      if (infinite) {
        return prev - 1;
      }
      return Math.max(prev - 1, 0);
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(Math.max(index, 0), maxIndex));
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  // Funciones para manejo de swipe táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const swipeDistance = touchStart - touchEnd;
    const minSwipeDistance = 50; // Mínimo de 50px para considerar un swipe

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe a la izquierda - ir al siguiente
        goToNext();
      } else {
        // Swipe a la derecha - ir al anterior
        goToPrev();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
    setIsDragging(true);
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const swipeDistance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`flex ${isTransitioning ? "transition-transform duration-500 ease-out" : ""} select-none`}
          style={{
            transform: `translateX(-${(currentIndex * 100) / itemsVisible}%)`,
          }}
        >
          {displayItems.map((child, index) => (
            <div
              key={`carousel-item-${index}`}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / itemsVisible}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Hidden on mobile */}
      {(totalItems > itemsVisible || infinite) && (
        <>
          <Button
            onClick={goToPrev}
            disabled={!infinite && currentIndex === 0}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-secondary hover:bg-secondary/90 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-10 h-10 items-center justify-center"
            aria-label="Anterior"
            variant="tertiary"
            size="sm"
          >
            ←
          </Button>
          <Button
            onClick={goToNext}
            disabled={!infinite && currentIndex >= maxIndex}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-secondary hover:bg-secondary/90 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-full w-10 h-10 items-center justify-center"
            aria-label="Siguiente"
            variant="tertiary"
            size="sm"
          >
            →
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {!infinite && totalItems > itemsVisible && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Ir a la diapositiva ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
