import { useEffect, useState, useRef } from "react";

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Animation variants
export const fadeIn = (isVisible: boolean, delay = 0) => ({
  opacity: isVisible ? 1 : 0,
  transform: `translateY(${isVisible ? 0 : 40}px)`,
  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
});

export const fadeInLeft = (isVisible: boolean, delay = 0) => ({
  opacity: isVisible ? 1 : 0,
  transform: `translateX(${isVisible ? 0 : -60}px)`,
  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
});

export const fadeInRight = (isVisible: boolean, delay = 0) => ({
  opacity: isVisible ? 1 : 0,
  transform: `translateX(${isVisible ? 0 : 60}px)`,
  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
});

export const scaleIn = (isVisible: boolean, delay = 0) => ({
  opacity: isVisible ? 1 : 0,
  transform: `scale(${isVisible ? 1 : 0.9})`,
  transition: `all 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
});
