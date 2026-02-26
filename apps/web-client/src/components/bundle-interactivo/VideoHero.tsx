import React, { useState, useEffect, useRef } from "react";
import { Video } from "@/components/ui/Video";

interface VideoHeroProps {
  videoSrc: string;
  posterSrc?: string;
  title: string;
  subtitle?: string;
  description?: string;
  cta?: {
    text: string;
    href: string;
  };
  height?: "md" | "lg" | "xl";
}

export const VideoHero: React.FC<VideoHeroProps> = ({
  videoSrc,
  posterSrc,
  title,
  subtitle,
  description,
  cta,
  height = "lg",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting && videoElement) {
          videoElement.play();
        } else if (videoElement) {
          videoElement.pause();
        }
      },
      { threshold: 0.5 },
    );

    if (videoElement) {
      observer.observe(videoElement);
    }

    return () => {
      if (videoElement) {
        observer.unobserve(videoElement);
      }
    };
  }, []);

  const heightClasses = {
    md: "h-[60vh]",
    lg: "h-[80vh]",
    xl: "h-[100vh]",
  };

  return (
    <section
      className={`relative w-full ${heightClasses[height]} overflow-hidden bg-bg-dark flex items-center justify-center`}
    >
      {/* Video Background */}
      <Video
        ref={videoRef}
        className="absolute inset-0 w-full h-full"
        src={videoSrc}
        poster={posterSrc}
        preload="metadata"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {subtitle && (
          <div
            className={`inline-block bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-full px-6 py-2 mb-6 transition-all duration-700 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="text-primary text-sm font-bold uppercase tracking-wider">
              {subtitle}
            </span>
          </div>
        )}

        <h1
          className={`text-4xl md:text-6xl lg:text-7xl font-display font-extrabold text-white leading-[1.05] tracking-tight mb-6 transition-all duration-700 delay-100 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {title}
        </h1>

        {description && (
          <p
            className={`text-lg md:text-xl lg:text-2xl text-gray-300 font-light leading-relaxed mb-10 max-w-3xl mx-auto transition-all duration-700 delay-200 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {description}
          </p>
        )}

        {cta && (
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-3 bg-primary hover:bg-white text-white hover:text-primary font-display font-bold px-10 py-5 rounded-full transition-all duration-300 shadow-[0_20px_60px_rgba(242,95,12,0.4)] hover:shadow-[0_25px_70px_rgba(255,255,255,0.3)] transform hover:scale-105 ${
              isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: "300ms" }}
          >
            {cta.text}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </a>
        )}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
