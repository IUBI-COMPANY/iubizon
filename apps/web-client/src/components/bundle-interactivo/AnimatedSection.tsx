import React, { ReactNode } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 700,
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: "-50px",
  });

  const getTransform = () => {
    switch (direction) {
      case "up":
        return "translate-y-12";
      case "down":
        return "-translate-y-12";
      case "left":
        return "translate-x-12";
      case "right":
        return "-translate-x-12";
      default:
        return "translate-y-12";
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0)" : undefined,
      }}
    >
      <div className={isVisible ? "" : getTransform()}>{children}</div>
    </div>
  );
};
